namespace Matcher.Tests 
module Common = 
    open Engine.Match.DSL.MatchDSL
    open FSharp.Data;

    let validator jsonString = Match (JsonValue.Parse jsonString)
    let createContext seq = fun name -> seq |> Seq.tryFind (fun (k,v)->k = name) |> Option.map (fun (k,v)->v)
    let context = createContext;

