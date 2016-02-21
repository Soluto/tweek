module Matcher.Tests

// https://github.com/fsharp/FsCheck/blob/master/Docs/Documentation.md
// https://github.com/fsharp/FsUnit
// https://code.google.com/p/unquote/

open FsUnit
open FsCheck
open NUnit.Framework
open Swensen.Unquote
open Engine.Match.DSL.MatchDSL
open FSharp.Data;

[<Test>]
let ``FsUnit test 1``() =
    let scheme = JsonValue.Parse("""{"$or": {"Age": {"$and": {"$gt" : 20, "$lt" : 23 }} , "Weight": {"$lt":80}} }""")
    //let scheme = JsonValue.Parse("""{"Age": {"$and": {"$gt" : 20, "$lt" : 23 }}}""")
    let context (x) = 
        match x with 
        |"Age"-> Option.Some("25")
        |"Weight"-> Option.Some("70")
        | _ -> Option.None
                                
    Match(scheme, context, (&&) ) |> should equal true;

