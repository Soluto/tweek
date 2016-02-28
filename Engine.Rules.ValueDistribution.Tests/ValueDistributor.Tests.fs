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

let assertCalculated (weights:float[]) (numberOfUsers:int) (samplingError:float) (calcFunction:obj[]->string)  = 
            let sumWeights = weights |> Array.sum
            let values = [|1..numberOfUsers|] 
                        |> Seq.map (fun x-> calcFunction([|x|]))
                        |> Seq.countBy id
                        |> Seq.sortBy fst 
                        |> Seq.zip weights
                        |> Seq.toArray;
                        
            values |> Seq.map (fun (expectedWeight, (_,actualWeight) )->  
                        ( ((float actualWeight)/(float numberOfUsers)), (expectedWeight/sumWeights) )) 
                        |> Seq.iter (fun (expected, actual ) ->
                        expected |> should (equalWithin samplingError) actual)

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
    let totalUsers = 100000
    let samplingError = 0.01
    assertCalculated weights totalUsers samplingError calculatorWeighted


let rand = Gen.sequence ([Gen.elements([1..10]);
                          Gen.elements([1..10]);
                          Gen.elements([1..10]);
                          ]) |> Arb.fromGen


[<Property>]
let ``run many tests and verify similar values``()=
    let gen = Gen.sequence ([Gen.elements([1..10]);
                          Gen.elements([1..10]);
                          Gen.elements([1..10]);
                          ]) |> Arb.fromGen
    let totalUsers = 10000
    let samplingError = 0.02
    Prop.forAll gen (fun test -> 
                        let weights = test |> Seq.map float |> Seq.toArray
                        let calculatorWeighted = generatedCalculatedScheme weights
                        assertCalculated weights totalUsers samplingError calculatorWeighted
    )
                          