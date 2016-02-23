module MatchTests
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

