module PartitionsTests

open FsUnit
open Xunit
open FsCheck.Xunit;
open Swensen.Unquote
open FSharp.Data;
open Microsoft.FSharp.Reflection;
open Newtonsoft.Json
open Tweek.JPad
open FsCheck
open System

let parser = JPadParser({Comparers=System.Collections.Generic.Dictionary()})
let createContext seq = ContextDelegate(fun name -> seq |> Seq.tryFind (fun (k,v)->k = name) |> Option.map (fun (k,v)->JsonValue.String v))
let validate (rules:JPadEvaluateExt) context value = rules.Invoke context |> should equal (Some value)

[<Fact>]
let ``Use partitions with simple values``() =
    let rules = parser.Parse """
    {
	    "partitions": ["fruit", "cultivar"],
	    "rules":{
		    "apple": {
			    "smith": "green",
			    "*": "red"
		    },
            "banana": "yellow",
		    "*": "unknown"
	    }
    }"""
    validate rules (createContext [("fruit", "Apple");("cultivar", "smith");]) "green"
    validate rules (createContext [("fruit", "apple");("cultivar", "granny");]) "red"
    validate rules (createContext [("fruit", "apple")]) "red"
    validate rules (createContext [("fruit", "banana")]) "yellow"
    validate rules (createContext [("fruit", "grapes")]) "unknown"
    validate rules (createContext []) "unknown"

[<Fact>]
let ``Use partitions with full rules``() =
    let rules = parser.Parse """
    {
	    "partitions": ["fruit"],
	    "rules":{
		    "apple": [{
			            "Matcher": {
                            "cultivar": "smith"
                            },
                        "Value": "green",
                        "Type": "SingleVariant"
		            },
                    {
			            "Matcher": {},
                        "Type": "SingleVariant",
                        "Value": "red"
		            }],
            "banana": "yellow",
		    "*": "unknown"
	    }
    }"""
    validate rules (createContext [("fruit", "apple");("cultivar", "smith");]) "green"
    validate rules (createContext [("fruit", "apple");("cultivar", "granny");]) "red"
    validate rules (createContext [("fruit", "apple")]) "red"
    validate rules (createContext [("fruit", "banana")]) "yellow"
    validate rules (createContext [("fruit", "grapes")]) "unknown"
    validate rules (createContext []) "unknown"
