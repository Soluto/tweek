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
let createContext seq  =  fun (name:string) -> seq |> Seq.tryFind (fun (k,v)-> k = name) |> Option.map (fun (k,v)-> v)
let context = createContext;

[<Fact>]
let ``Use multipe-comparisons, "and" is implict``() =
    let validate = validator """{"Age": {"$le":30, "$ge":25} }"""

    validate (context [("Age", JsonValue.Number(30m));])  |> should equal true;
    validate (context [("Age", JsonValue.Number(26m));])  |> should equal true;
    validate (context [("Age", JsonValue.Number(31m));])  |> should equal false;
    validate (context [("Age", JsonValue.Number(24m));])  |> should equal false;

[<Fact>]
let ``Use comparisons on multipe fields, "and" is implict``() =
    let validate = validator """{"Age": 20, "Weight": 40 }"""
    validate (context [("Age", JsonValue.Number(20m));("Weight", JsonValue.Number(40m))])  |> should equal true;
    validate (context [("Age", JsonValue.Number(20m));("Weight", JsonValue.Number(39m))])  |> should equal false;
    validate (context [("Age", JsonValue.Number(19m));("Weight", JsonValue.Number(40m))])  |> should equal false;

[<Fact>]
let ``Use not ``() =
    let validate = validator """{"$not":{"Age": {"$lt":21}}}"""
    validate (context [("Age", JsonValue.Number(22m));])  |> should equal true;
    validate (context [("Age", JsonValue.Number(20m));])  |> should equal false;
    
[<Fact>]
let ``Use logical operater at root``() =
    let validate = validator """{"$or": {"Age": {"$gt" : 20, "$lt" : 23 } , "Weight": {"$lt":80}} }""";
    validate (context [("Age", JsonValue.Number(25m));("Weight", JsonValue.Number(70m))]) |> should equal true;
    validate (context [("Age", JsonValue.Number(25m));("Weight", JsonValue.Number(80m))]) |> should equal false;
    validate (context [("Age", JsonValue.Number(22m));("Weight", JsonValue.Number(70m))]) |> should equal true;
    validate (context [("Age", JsonValue.Number(22m));("Weight", JsonValue.Number(80m))]) |> should equal true;

[<Fact>]
let ``"nested" context``() =
    let validate = validator """{"Person": {"Age": 25 }}""";
    validate (context [("Person.Age", JsonValue.Number(25m))]) |> should equal true;

[<Fact>]
let ``use custom comparer``() =
    let comparers = dict([("version", new ComparerDelegate(fun x -> Version.Parse(x) :> IComparable))]);
    let matcher = """{"AgentVersion": {"$compare": "version", "$gt": "1.5.1", "$le": "1.15.2" }}""" |> JsonValue.Parse |> Matcher.parse;
    let validate =  Matcher.createEvaluator {Comparers=comparers} matcher;
    validate (context [("AgentVersion", JsonValue.String("1.15.1"))]) |> should equal true;

[<Fact>]
let ``use custom comparer with broken mismatched target value should fail in compile time``() =
    let comparers = dict([("version", new ComparerDelegate(fun x -> Version.Parse(x) :> IComparable))]);
    let matcher = """{"AgentVersion": {"$compare": "version", "$gt": "debug-1.5.1", "$le": "1.15.2" }}""" |> JsonValue.Parse |> Matcher.parse;
    (fun () ->(Matcher.createEvaluator {Comparers=comparers}) matcher |> ignore) |> should throw typeof<ParseError>

[<Fact>]
let ``exist/not exist prop support -> expressed with null``() =
    let validate = validator """{"Person": {"Age": null }}""";
    validate (context [("Person.Age", JsonValue.Number(20m))]) |> should equal false;
    validate (context [("abc", JsonValue.Number(30m))]) |> should equal true;
    validate (context []) |> should equal true;
    let validateWithNot = validator """{"Person": {"Age": {"$not": null} }}""";
    validateWithNot (context [("Person.Age", JsonValue.Number(20m))]) |> should equal true;
    validateWithNot (context [("abc", JsonValue.Number(30m))]) |> should equal false;
    validateWithNot (context []) |> should equal false;


[<Fact>]
let ``in operator support ``() =
    let validate = validator """{"Person": {"Age": {"$in" :[10,20,30]}}}""";
    validate (context [("Person.Age", JsonValue.Number(20m))]) |> should equal true;
    validate (context [("Person.Age", JsonValue.Number(21m))]) |> should equal false;
    validate (context [("Person.Age", JsonValue.Number(100m))]) |> should equal false;
    validate (context [("Person.Age", JsonValue.Number(10m))]) |> should equal true;


[<Fact>]
let ``Use Equal``() =
    let validate = validator """{"Age": {"$eq": 30 }}"""
    validate (context [("Age", JsonValue.Number(31m));])  |> should equal false
    validate (context [("Age", JsonValue.Number(30m));])  |> should equal true
    validate (context [("Age", JsonValue.Number(29m));])  |> should equal false

[<Fact>]
let ``Use greaterEqual``() =
    let validate = validator """{"Age": {"$ge": 30 }}"""
    validate (context [("Age", JsonValue.Number(31m));])  |> should equal true
    validate (context [("Age", JsonValue.Number(30m));])  |> should equal true
    validate (context [("Age", JsonValue.Number(29m));])  |> should equal false

[<Fact>]
let ``Use lessEqual``() =
    let validate = validator """{"Age": {"$le": 30 }}"""
    validate (context [("Age", JsonValue.Number(31m));])  |> should equal false
    validate (context [("Age", JsonValue.Number(30m));])  |> should equal true
    validate (context [("Age", JsonValue.Number(29m));])  |> should equal true

[<Fact>]
let ``Use lessThanOp``() =
    let validate = validator """{"Age": {"$lt": 30 }}"""
    validate (context [("Age", JsonValue.Number(31m));])  |> should equal false
    validate (context [("Age", JsonValue.Number(30m));])  |> should equal false
    validate (context [("Age", JsonValue.Number(29m));])  |> should equal true

[<Fact>]
let ``Use greaterThenOp``() =
    let validate = validator """{"Age": {"$gt": 30 }}"""
    validate (context [("Age", JsonValue.Number(31m));])  |> should equal true
    validate (context [("Age", JsonValue.Number(30m));])  |> should equal false
    validate (context [("Age", JsonValue.Number(29m));])  |> should equal false

[<Fact>]
let ``Use implict Equal``() =
    let validate = validator """{"Age": 30 }"""
    let explictValidate = validator """{"Age": {"$eq": 30 } }"""
    let compareValidators ctx = (validate ctx) |> should equal (explictValidate ctx)
    compareValidators (context [("Age", JsonValue.Number(31m));]) 
    compareValidators (context [("Age", JsonValue.Number(30m));]) 
    compareValidators (context [("Age", JsonValue.Number(29m));]) 

[<Fact>]
let ``Compare numeric values``() =
    let validate = validator """{"Age": 30}"""
    validate (context [("Age", JsonValue.Number(30m));])  |> should equal true
    validate (context [("Age", JsonValue.Number(31m));])  |> should equal false

[<Fact>]
let ``Compare string values``() =
    let validate = validator """{"Country": "Germany"}"""
    validate (context [("Country", JsonValue.String("Germany"));])  |> should equal true
    validate (context [("Country", JsonValue.String("France"));])  |> should equal false

[<Fact>]
let ``Compare boolean values``() =
    let validate = validator """{"IsVIP": true}"""
    validate (context [("IsVIP", JsonValue.Boolean(true));])  |> should equal true
    validate (context [("IsVIP", JsonValue.Boolean(false));])  |> should equal false

[<Fact>]
let ``Use null value in rule``() =
    let validate = validator """{"GroupName": null}"""
    validate (context [("GroupName", JsonValue.String("Some Group"));])  |> should equal false
    validate (context [("GroupName", JsonValue.Null);])  |> should equal true
    validate (context [])  |> should equal true

[<Fact>]
let ``Compare to null value from context``() =
    let validate = validator """{"GroupName": "Some Group"}"""
    validate (context [("GroupName", JsonValue.String("Some Group"));])  |> should equal true
    validate (context [("GroupName", JsonValue.Null);])  |> should equal false
    validate (context [])  |> should equal false

[<Fact>]
let ``Compare incompatible values``() =
    let validate = validator """{"Age": 30}"""
    (fun () -> validate (context [("Age", JsonValue.String("Oopsy"));]) |> ignore) |> should throw typeof<Exception>