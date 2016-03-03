module Matcher.Tests.Main

// https://github.com/fsharp/FsCheck/blob/master/Docs/Documentation.md
// https://github.com/fsharp/FsUnit
// https://code.google.com/p/unquote/

open FsUnit
open Xunit
open FsCheck.Xunit;
open Swensen.Unquote
open Engine.Match.DSL.MatchDSL
open FSharp.Data;
open Microsoft.FSharp.Reflection;
open Matcher.Tests.Common;

[<Fact>]
let ``Use multipe-comparisons, "and" is implict``() =
    let validate = validator """{"Age": {"$le":30, "$ge":25} }"""
    validate (context [("Age", "30");])  |> should equal true;
    validate (context [("Age", "26");])  |> should equal true;
    validate (context [("Age", "31");])  |> should equal false;
    validate (context [("Age", "24");])  |> should equal false;

[<Fact>]
let ``Use comparisons on multipe fields, "and" is implict``() =
    let validate = validator """{"Age": 20, "Weight": 40 }"""
    validate (context [("Age", "20");("Weight","40");])  |> should equal true;
    validate (context [("Age", "20");("Weight","39");])  |> should equal false;
    validate (context [("Age", "19");("Weight","40");])  |> should equal false;

    
[<Fact>]
let ``Use not ``() =
    let addNot schema = """{"$not":{"Age": {"$lt":21}}}"""
    let validate = validator """{"$not":{"Age": {"$lt":21}}}"""
    validate (context [("Age", "22");])  |> should equal true;
    


[<Fact>]
let ``Use logical operater at root``() =
    let validate = validator """{"$or": {"Age": {"$gt" : 20, "$lt" : 23 } , "Weight": {"$lt":80}} }""";
    validate (context [("Age", "25");("Weight", "70")]) |> should equal true;
    validate (context [("Age", "25");("Weight", "80")]) |> should equal false;
    validate (context [("Age", "22");("Weight", "70")]) |> should equal true;
    validate (context [("Age", "22");("Weight", "80")]) |> should equal true;
