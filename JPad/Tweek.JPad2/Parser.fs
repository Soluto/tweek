namespace Tweek.JPad
open FSharp.Data
open System;

module JPad2 = 
    type ComparerDelegate = delegate of string-> IComparable
    type Context = string-> Option<string>
    type ContextDelegate = delegate of string-> Option<string>
    type ParserSettings = {Comparers: System.Collections.Generic.IDictionary<string,ComparerDelegate>}
    exception ParseError of string
    type JPadEvaluate = Context -> Option<string>

    type public JPadEvaluateExt = delegate of ContextDelegate -> Option<string>

    type JPad = {
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

    type PatternType = 
        | Exact
        | Pattern
        | Default

    let parsePatternType (input:string) = if input = "*" then PatternType.Default else PatternType.Exact

    let rec buildPatternBlock depth pattern (rulesData:(string * JsonValue)[]) : PatternBlock =
            match pattern with
                | PatternType.Exact -> 
                    rulesData |> 
                    Array.map (fun (k,v) -> (k, buildRulesContainer (depth - 1) v) ) |>
                    Map.ofArray |>
                    PatternBlock.Map
                | PatternType.Default -> buildRulesContainer (depth - 1) (snd rulesData.[0]) |> PatternBlock.Default      

    and buildRulesContainer (depth) (rulesData:JsonValue)  : RulesContainer =
            match (rulesData) with
                | JsonValue.String s when (depth = 0) -> s |> RulesContainer.RuleSimpleValue
                | JsonValue.String s when (depth > 0) -> [|buildPatternBlock depth PatternType.Default [|("*",JsonValue.String(s))|]|] |>
                                                         RulesContainer.RulesByPartition
                | JsonValue.Record r when (depth > 0) -> 
                    r |> Array.groupBy (fst >> parsePatternType) |>
                    Array.map (fun (patternType,data) -> buildPatternBlock depth patternType data) |>
                    RulesContainer.RulesByPartition

    let evaluatePatternBlock block contextValue =
        match block, contextValue with
            |Map map, Some value ->  map.TryFind(value);
            |Map map, None -> None;
            |PatternBlock.Default container, _ -> Some(container);

    let rec createRuleContainerEvaluator (partitions:List<string>) (rulesContainer:RulesContainer) : JPadEvaluate =
        match rulesContainer, partitions with
                |RulesByPartition rules, (partitionType :: nextPartitions) -> (fun (ctx:Context)->
                    let partitionValue = ctx partitionType
                    let childContainer = rules |> Seq.ofArray |> 
                                                  Seq.map (fun block -> evaluatePatternBlock block partitionValue) |>
                                                  Seq.tryFind Option.isSome |> 
                                                  Option.bind id;

                    match childContainer with
                        |Some c -> ctx |> (createRuleContainerEvaluator nextPartitions c)
                        |None -> None
                        )
                |RuleSimpleValue value, [] -> (fun (ctx:Context)-> Some(value))
    
    type public JPadParser(settings:ParserSettings) = 
        member this.Parse : (string-> JPadEvaluate) = 
            JsonValue.Parse >>
            JPadParser.buildAST >>
            JPadParser.buildEvaluator

        static member private buildAST (json:JsonValue) : JPad =
            match json with
            | JsonValue.Record r->
                let partitions = (json.GetProperty "partitions") |> JsonExtensions.AsArray |> Array.map JsonExtensions.AsString;
                let rules = (json.GetProperty "rules");

                { Partitions = partitions;
                  Rules = buildRulesContainer partitions.Length rules
                  }
            
        static member private buildEvaluator (jpad:JPad) :JPadEvaluate =
            createRuleContainerEvaluator (jpad.Partitions |> List.ofArray) jpad.Rules