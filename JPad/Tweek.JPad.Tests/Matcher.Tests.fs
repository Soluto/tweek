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
open Tweek.JPad;
open System;

let validator jsonString = Matcher.createEvaluator {Comparers=dict(Seq.empty)} (jsonString|>JsonValue.Parse|>Matcher.parse)
let createContext seq = fun name -> seq |> Seq.tryFind (fun (k,v)->k = name) |> Option.map (fun (k,v)->v)
let context = createContext;

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

[<Fact>]
let ``"nested" context``() =
    let validate = validator """{"Person": {"Age": 25 }}""";
    validate (context [("Person.Age", "25")]) |> should equal true;

[<Fact>]
let ``use custom comparer``() =
    let comparers = dict([("version", new ComparerDelegate(fun x -> Version.Parse(x) :> IComparable))]);
    let matcher = """{"AgentVersion": {"$compare": "version", "$gt": "1.5.1", "$le": "1.15.2" }}""" |> JsonValue.Parse |> Matcher.parse;
    let validate =  Matcher.createEvaluator {Comparers=comparers} matcher;
    validate (context [("AgentVersion", "1.15.1" )]) |> should equal true;

[<Fact>]
let ``use custom comparer with broken mismatched target value should fail in compile time``() =
    let comparers = dict([("version", new ComparerDelegate(fun x -> Version.Parse(x) :> IComparable))]);
    let matcher = """{"AgentVersion": {"$compare": "version", "$gt": "debug-1.5.1", "$le": "1.15.2" }}""" |> JsonValue.Parse |> Matcher.parse;
    (fun () ->(Matcher.createEvaluator {Comparers=comparers}) matcher |> ignore) |> should throw typeof<ParseError>

[<Fact>]
let ``exist/not exist prop support -> expressed with null``() =
    let validate = validator """{"Person": {"Age": null }}""";
    validate (context [("Person.Age", "20" )]) |> should equal false;
    validate (context [("abc", "30")]) |> should equal true;
    validate (context []) |> should equal true;
    let validateWithNot = validator """{"Person": {"Age": {"$not": null} }}""";
    validateWithNot (context [("Person.Age", "20" )]) |> should equal true;
    validateWithNot (context [("abc", "30")]) |> should equal false;
    validateWithNot (context []) |> should equal false;


[<Fact>]
let ``in operator support ``() =
    let validate = validator """{"Person": {"Age": {"$in" :[10,20,30]}}}""";
    validate (context [("Person.Age", "20" )]) |> should equal true;
    validate (context [("Person.Age", "21" )]) |> should equal false;
    validate (context [("Person.Age", "100" )]) |> should equal false;
    validate (context [("Person.Age", "10" )]) |> should equal true;


[<Fact>]
let ``Use Equal``() =
    let validate = validator """{"Age": {"$eq": 30 }}"""
    validate (context [("Age", "31");])  |> should equal false
    validate (context [("Age", "30");])  |> should equal true
    validate (context [("Age", "29");])  |> should equal false

[<Fact>]
let ``Use greaterEqual``() =
    let validate = validator """{"Age": {"$ge": 30 }}"""
    validate (context [("Age", "31");])  |> should equal true
    validate (context [("Age", "30");])  |> should equal true
    validate (context [("Age", "29");])  |> should equal false

[<Fact>]
let ``Use lessEqual``() =
    let validate = validator """{"Age": {"$le": 30 }}"""
    validate (context [("Age", "31");])  |> should equal false
    validate (context [("Age", "30");])  |> should equal true
    validate (context [("Age", "29");])  |> should equal true

[<Fact>]
let ``Use lessThanOp``() =
    let validate = validator """{"Age": {"$lt": 30 }}"""
    validate (context [("Age", "31");])  |> should equal false
    validate (context [("Age", "30");])  |> should equal false
    validate (context [("Age", "29");])  |> should equal true

[<Fact>]
let ``Use greaterThenOp``() =
    let validate = validator """{"Age": {"$gt": 30 }}"""
    validate (context [("Age", "31");])  |> should equal true
    validate (context [("Age", "30");])  |> should equal false
    validate (context [("Age", "29");])  |> should equal false

[<Fact>]
let ``Use implict Equal``() =
    let validate = validator """{"Age": 30 }"""
    let explictValidate = validator """{"Age": {"$eq": 30 } }"""
    let compareValidators ctx = (validate ctx) |> should equal (explictValidate ctx)
    compareValidators (context [("Age", "31");]) 
    compareValidators (context [("Age", "30");]) 
    compareValidators (context [("Age", "29");]) 
