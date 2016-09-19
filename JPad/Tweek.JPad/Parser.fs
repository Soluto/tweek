namespace Tweek.JPad
open FSharp.Data
open System;
open Tweek.JPad.Grammer

type public JPadEvaluateExt = delegate of ContextDelegate -> Option<string>

type public JPadParser(settings:ParserSettings) = 
    
    //parsing
    let parsePatternType (input:string) = if input = "*" then PatternType.Default else PatternType.Exact
    
    let rec parsePatternBlock depth pattern (rulesData:(string * JsonValue)[]) : PatternBlock =
            match pattern with
                | PatternType.Exact -> 
                    rulesData |> 
                    Array.map (fun (k,v) -> (k, parseRulesContainer (depth - 1) v) ) |>
                    Map.ofArray |>
                    PatternBlock.Map
                | PatternType.Default -> parseRulesContainer (depth - 1) (snd rulesData.[0]) |> PatternBlock.Default      
                | PatternType.Pattern -> raise (ParseError("complex patterns are not supported yet"))
    
    and parseRulesContainer (depth) (rulesData:JsonValue)  : RulesContainer =
            match (rulesData) with
                | JsonValue.String s when (depth = 0) -> s |> RulesContainer.RuleSimpleValue
                | JsonValue.String s when (depth > 0) -> [|parsePatternBlock depth PatternType.Default [|("*",JsonValue.String(s))|]|] |>
                                                         RulesContainer.RulesByPartition
                | JsonValue.Array rules when (depth = 0) -> rules |> Array.map Rule.parse |> RulesContainer.RulesList
                
                | JsonValue.Record r when (depth > 0) -> 
                    r |> Array.groupBy (fst >> parsePatternType) |>
                    Array.map (fun (patternType,data) -> parsePatternBlock depth patternType data) |>
                    RulesContainer.RulesByPartition
                
    
    and buildAST (json:JsonValue) : JPad =
        match json with
        | JsonValue.Record r->
            let partitions = (json.GetProperty "partitions") |> JsonExtensions.AsArray |> Array.map JsonExtensions.AsString;
            let rules = (json.GetProperty "rules");
    
            { Partitions = partitions;
              Rules = parseRulesContainer partitions.Length rules
              } 
        | JsonValue.Array jpad1rules -> jpad1rules |> 
                                        Array.map Rule.parse |>
                                        RulesContainer.RulesList |>
                                        (fun rules->{Partitions = [||]; Rules=  rules})
    //--
    
    //evaluating
    let rec createRuleContainerEvaluator (partitions:List<string>) (rulesContainer:RulesContainer)  : JPadEvaluate =
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
                |RulesList rules, _ -> 
                    let rulesFns = rules |> Array.map (Rule.buildEvaluator settings);
                    (fun context->
                    rulesFns |> Array.map (fun e -> e context) |> Seq.tryFind Option.isSome |> Option.bind id)
                                                
    
     and evaluatePatternBlock block contextValue =
        match block, contextValue with
            |Map map, Some value ->  map.TryFind(value);
            |Map map, None -> None;
            |PatternBlock.Default container, _ -> Some(container);
    //--
    
    //api
    let buildEvaluator (jpad:JPad) :JPadEvaluateExt =
        createRuleContainerEvaluator (jpad.Partitions |> List.ofArray) jpad.Rules |>
        (fun evaluator -> JPadEvaluateExt(fun context -> evaluator context.Invoke))
    
    member public this.Parse : (string-> JPadEvaluateExt) = 
        JsonValue.Parse >>
        buildAST >>
        buildEvaluator
    //--
    