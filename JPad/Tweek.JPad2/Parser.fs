namespace Tweek.JPad
open FSharp.Data
open System;

module JPad2 = 
    //Common
    type ComparerDelegate = delegate of string-> IComparable
    type Context = string-> Option<string>
    type ContextDelegate = delegate of string-> Option<string>
    type ParserSettings = {Comparers: System.Collections.Generic.IDictionary<string,ComparerDelegate>}
    exception ParseError of string
    type JPadEvaluate = Context -> Option<string>
    type public JPadEvaluateExt = delegate of ContextDelegate -> Option<string>
    //--

    //Grammer
    type JPad2 = {
        Partitions:Partitions
        Rules: RulesContainer
    }
    and Partitions = string[]
    and RulesContainer = 
        | RuleSimpleValue of string
        | RulesByPartition of PatternBlock[]
        | JPad1Rules
    and PatternBlock =
        | Map of Map<String,RulesContainer>
        | Patterns of (Pattern * RulesContainer)[]
        | Default of RulesContainer
    and RuleSimpleValue = string
    and Pattern = string
    and PatternType = 
        | Exact
        | Pattern
        | Default
    //--

    type public JPad2Parser(settings:ParserSettings) = 
        //Parser
        let parsePatternType (input:string) = if input = "*" then PatternType.Default else PatternType.Exact

        let rec parsePatternBlock depth pattern (rulesData:(string * JsonValue)[]) : PatternBlock =
                match pattern with
                    | PatternType.Exact -> 
                        rulesData |> 
                        Array.map (fun (k,v) -> (k, parseRulesContainer (depth - 1) v) ) |>
                        Map.ofArray |>
                        PatternBlock.Map
                    | PatternType.Default -> parseRulesContainer (depth - 1) (snd rulesData.[0]) |> PatternBlock.Default      

        and parseRulesContainer (depth) (rulesData:JsonValue)  : RulesContainer =
                match (rulesData) with
                    | JsonValue.String s when (depth = 0) -> s |> RulesContainer.RuleSimpleValue
                    | JsonValue.String s when (depth > 0) -> [|parsePatternBlock depth PatternType.Default [|("*",JsonValue.String(s))|]|] |>
                                                             RulesContainer.RulesByPartition
                    | JsonValue.Record r when (depth > 0) -> 
                        r |> Array.groupBy (fst >> parsePatternType) |>
                        Array.map (fun (patternType,data) -> parsePatternBlock depth patternType data) |>
                        RulesContainer.RulesByPartition

        and buildAST (json:JsonValue) : JPad2 =
            match json with
            | JsonValue.Record r->
                let partitions = (json.GetProperty "partitions") |> JsonExtensions.AsArray |> Array.map JsonExtensions.AsString;
                let rules = (json.GetProperty "rules");

                { Partitions = partitions;
                  Rules = parseRulesContainer partitions.Length rules
                  }
            | JsonValue.Array jpad1rules -> raise (ParseError("jpad1 rules is not supported yet"))
        //--

        //Evaluate
        let rec createRuleContainerEvaluator (partitions:List<string>) (rulesContainer:RulesContainer) : JPadEvaluate =
            match rulesContainer, partitions with
                    |RulesByPartition rules, (partitionType :: nextPartitions) -> (fun (ctx:Context)->
                        let partitionValue = ctx partitionType
                        let childContainer = rules |> Seq.ofArray |> 
                                                      Seq.map (fun block -> evaluatePatternBlock block partitionValue) |>
                                                      Seq.tryFind Option.isSome |> 
                                                      Option.bind id;

                        match childContainer with
                            |Some child -> ctx |> (createRuleContainerEvaluator nextPartitions child)
                            |None -> None
                            )
                    |RuleSimpleValue value, [] -> (fun (ctx:Context)-> Some(value))
                    |JPad1Rules, _ -> raise (ParseError("jpad1 rules is not supported yet"))

         and evaluatePatternBlock block contextValue =
            match block, contextValue with
                |Map map, Some value ->  map.TryFind(value);
                |Map map, None -> None;
                |PatternBlock.Default container, _ -> Some(container);
        //--
        
        //api
        let buildEvaluator (jpad:JPad2) :JPadEvaluateExt =
            createRuleContainerEvaluator (jpad.Partitions |> List.ofArray) jpad.Rules |>
            (fun evaluator -> JPadEvaluateExt(fun context -> evaluator context.Invoke))

        member public this.Parse : (string-> JPadEvaluateExt) = 
            JsonValue.Parse >>
            buildAST >>
            buildEvaluator
    //--