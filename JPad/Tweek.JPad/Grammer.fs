namespace Tweek.JPad
open FSharp.Data;
open System;

module Grammer = 
    type JPad = {
        Partitions:Partitions
        Rules: RulesContainer
    }
    and Partitions = string[]
    and RulesContainer = 
        | RulesByPartition of PatternBlock[]
        | RulesList of (MatcherExpression * RuleValue) list
    and PatternBlock =
        | Map of Map<string,RulesContainer>
        | Patterns of (Pattern * RulesContainer) list
        | Default of RulesContainer
    and RuleSimpleValue = JsonValue
    and Pattern = string
    and PatternType = 
        | Exact
        | Pattern
        | Default
    and MatcherExpression = 
            | Property of PropertyName * MatcherExpression
            | Not of MatcherExpression
            | Binary of ConjuctionOp * MatcherExpression * MatcherExpression
            | Compare of CompareOp * ComparisonValue
            | ArrayTest of ArrayOp * ComparisonValue
            | SwitchComparer of string * MatcherExpression
            | Empty
    and RuleValue = 
        | SingleVariant of JsonValue
        | MultiVariant  of ValueDistribution
    and ValueDistribution = {
            HashFunction: (Object[])->FSharp.Data.JsonValue
            OwnerType: Option<string>
            Salt:string
        }
    and PropertyName = string
    and ConjuctionOp = And | Or 
    and CompareOp = Equal | GreaterThan | LessThan | GreaterEqual | LessEqual | NotEqual 
    and Op = 
        | CompareOp of CompareOp
        | ConjuctionOp of ConjuctionOp
        | ArrayOp of ArrayOp
        | Not
    and UnaryOp = Not
    and ArrayOp = In
    and ComparisonValue = JsonValue
