namespace Tweek.JPad
open FSharp.Data
open System;
open Tweek.JPad.Grammer

type public JPadEvaluateExt = delegate of ContextDelegate -> Option<JsonValue>

type public JPadParser(settings:ParserSettings) = 
    
    let seqFirstMatch fn seq = seq |> Seq.map fn |> Seq.tryFind Option.isSome |> Option.bind id
    //parsing
    let parsePatternType (input:string) = if input = "*" then PatternType.Default else PatternType.Exact
    
    let rec parsePatternBlock depth pattern (rulesData:(string * JsonValue)[]) : PatternBlock =
            match pattern with
                | PatternType.Exact -> 
                    rulesData |> 
                    Array.map (fun (partitionValue,rules) -> (partitionValue.ToLower(), parseRulesContainer (depth - 1) rules) ) |>
                    Map.ofArray |>
                    PatternBlock.Map
                | PatternType.Default -> parseRulesContainer (depth - 1) (snd rulesData.[0]) |> PatternBlock.Default      
                | PatternType.Pattern -> raise (ParseError("complex patterns are not supported yet"))
    
    and parseRulesContainer (depth) (rulesData:JsonValue)  : RulesContainer =
            match (rulesData) with
                | JsonValue.Array rules when (depth = 0) -> rules |> List.ofArray |> List.map Rule.parse |> RulesContainer.RulesList
                | value when (depth = 0) -> RulesContainer.RulesList [(MatcherExpression.Empty, SingleVariant(value))]
                | JsonValue.Record r when (depth > 0) -> 
                    r |> Array.groupBy (fst >> parsePatternType) |>
                    Array.map (fun (patternType,data) -> parsePatternBlock depth patternType data) |>
                    RulesContainer.RulesByPartition
                | JsonValue.String s when (depth > 0) -> [|parsePatternBlock depth PatternType.Default [|("*",JsonValue.String(s))|]|] |>
                                                         RulesContainer.RulesByPartition
                
    and buildAST (json:JsonValue) : JPad =
        match json with
        | JsonValue.Record r->
            let partitions = (json.GetProperty "partitions") |> JsonExtensions.AsArray |> Array.map JsonExtensions.AsString;
            let rules = (json.GetProperty "rules");
    
            { Partitions = partitions;
              Rules = parseRulesContainer partitions.Length rules
              } 
        | JsonValue.Array jpad1rules -> jpad1rules |> List.ofArray |>
                                        List.map Rule.parse |>
                                        RulesContainer.RulesList |>
                                        (fun rules->{Partitions = [||]; Rules=  rules})
    //--

    //evaluating
    let rec createRuleContainerEvaluator (partitions:List<string>) (rulesContainer:RulesContainer)  : JPadEvaluate =
        match rulesContainer, partitions with
                |RulesByPartition rules, (partitionType :: nextPartitions) -> (fun (ctx:Context)->
                    let partitionValue = ctx partitionType
                    let childContainer = rules |> Seq.ofArray |> 
                                                  seqFirstMatch (fun block -> evaluatePatternBlock block partitionValue)
                    
                    childContainer |> Option.bind (fun child -> ctx |> (createRuleContainerEvaluator nextPartitions child))
                    )
                |RulesList rules, [] -> 
                    let rulesFns = rules |> List.map (Rule.buildEvaluator settings);
                    (fun context-> rulesFns |> seqFirstMatch (fun rule -> rule context))
                                                
    
     and evaluatePatternBlock block contextValue =
        match block, contextValue with
            |Map map, Some value ->  map.TryFind(value.AsString().ToLower());
            |Map map, None -> None;
            |PatternBlock.Default container, _ -> Some(container);
    //--
    
    //api
    let buildEvaluator (jpad:JPad) :JPadEvaluateExt =
        createRuleContainerEvaluator (jpad.Partitions |> List.ofArray) jpad.Rules |>
        (fun evaluator -> JPadEvaluateExt(fun context -> evaluator context.Invoke))
    
    member public this.Parse : (string -> JPadEvaluateExt) = 
        JsonValue.Parse >>
        buildAST >>
        buildEvaluator
    //--
    