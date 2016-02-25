module Matcher.Tests.Main

// https://github.com/fsharp/FsCheck/blob/master/Docs/Documentation.md
// https://github.com/fsharp/FsUnit
// https://code.google.com/p/unquote/

open FsUnit
open Xunit
open FsCheck.Xunit;
open Swensen.Unquote
open FSharp.Data;
open Microsoft.FSharp.Reflection;
open Engine.Rules.ValueDistribution;

[<Fact>]
let ``Use value distrubtion``() =
    let calculator = ValueDistribution.CalculateValue """{"type": "value", "args": "5" }""" 
    calculator [|"userName", 5|]  |> should equal "5";
    
[<Fact>]
let ``Use uniform distrubtion with single value``() =
    let calculator = ValueDistribution.CalculateValue """{"type": "uniform", "args": ["5"] }""" 
    calculator [|"userName", 5|]  |> should equal "5";
    
[<Fact>]
let ``Use weighted distrubtion with single value``() =
    let calculator = ValueDistribution.CalculateValue """{"type": "weighted","args": {"5": 1} }""" 
    calculator [|"userName", 5|]  |> should equal "5";
