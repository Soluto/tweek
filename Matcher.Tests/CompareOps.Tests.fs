module Matcher.Tests.CompareOps


open FsUnit
open Xunit
open FsCheck.Xunit;
open Swensen.Unquote
open Engine.Match.DSL.MatchDSL
open FSharp.Data;
open Microsoft.FSharp.Reflection;

let validator jsonString = Match (JsonValue.Parse jsonString)
let createContext seq = fun name -> seq |> Seq.tryFind (fun (k,v)->k = name) |> Option.map (fun (k,v)->v)
let context = createContext;

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
