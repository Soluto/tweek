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
open Newtonsoft.Json
open FsCheck

let generatedCalculatedScheme weights = weights |> Array.mapi (fun a b -> (a,b) )
                                                |> dict 
                                                |> JsonConvert.SerializeObject 
                                                |> sprintf """{"type": "weighted","args": %s }""" 
                                                |> ValueDistribution.CalculateValue

let assertCalculated (weights:float[]) (numberOfUsers:int) (samplingError:int) (calcFunction:obj[]->string)  = 
            let sumWeights = weights |> Array.sum
            [|1..numberOfUsers|] 
                        |> Array.map (fun x-> calcFunction([|x|]))
                        |> Seq.countBy id
                        |> Seq.sortBy fst
                        |> Seq.zip weights
                        |> Seq.map (fun (expectedWeight, (_,actualWeight) )->  actualWeight/numberOfUsers |> should (equalWithin samplingError) (expectedWeight/sumWeights) )

[<Fact>]
let ``Use uniform distrubtion with single value``() =
    let calculator = ValueDistribution.CalculateValue """{"type": "uniform", "args": ["abc"] }""" 
    calculator [|"userName", 5|]  |> should equal "abc";
    
[<Fact>]
let ``Use weighted distrubtion with single value``() =
    let calculator = ValueDistribution.CalculateValue """{"type": "weighted","args": {"5": 1} }""" 
    calculator [|"userName", 5|]  |> should equal "5";

[<Property>]
let ``Use coin distrubtion should equal weighted``(userId:int) =
    let calculatorWeighted = ValueDistribution.CalculateValue """{"type": "weighted","args": {"true": 40, "false": 60} }""" 
    let calculatorCoin = ValueDistribution.CalculateValue """{"type": "coin","args": 0.4 }""" 
    calculatorWeighted [|userId|]  |> should equal (calculatorCoin [|userId|]);

[<Fact>]
let ``run single tests and verify similar values``()=
    let weights = [|1.0;5.0;6.0|]
    let calculatorWeighted = generatedCalculatedScheme weights
    let totalUsers = 10
    let samplingError = 1
    assertCalculated weights totalUsers samplingError calculatorWeighted


let rand = Gen.sequence ([Gen.elements([1..10]);
                          Gen.elements([0..10]);
                          Gen.elements([1..10])
                          ]) |> Arb.fromGen

(*    
[<Property>]
let ``run many tests and verify similar values``(ratio:int)=
    let percent = if ratio = 0 then ratio else (1.0 / (ratio|>float) ) * 100.0 |> abs |> int
    let calculatorWeighted = ValueDistribution.CalculateValue (sprintf """{"type": "weighted","args": {"true": %i, "false": %i} }""" percent (100-percent))
    [|1..1000|] 
            |> Array.map (fun x -> calculatorWeighted [|x|]) 
            |> Seq.countBy (fun x -> x) 
            |> dict
            |> fun x -> (match x.Count with
                        |1 -> if x.ContainsKey("true") then 100 else 0
                        |2 -> (x.["true"] |>float) / ((x.["true"] + x.["false"]) |>float )  * 100.0 |> int
                        )
            |> should (equalWithin 6) percent
 *)  