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
open System

let generatedCalculatedScheme weights = weights |> Array.mapi (fun a b -> (a,b) )
                                                |> dict 
                                                |> JsonConvert.SerializeObject 
                                                |> sprintf """{"type": "weighted","args": %s }""" 
                                                |> ValueDistribution.compile

let assertCalculated (weights:float[]) (numberOfUsers:int) (samplingError:float) (calcFunction:obj[]->string)  = 
            let sumWeights = weights |> Array.sum
            let rnd = new Random();
            [|1..numberOfUsers|] 
                        |> Seq.map (fun _-> rnd.Next(10000,100000))
                        |> Seq.map (fun x-> calcFunction([|x|]))
                        |> Seq.countBy id
                        |> Seq.sortBy fst 
                        |> Seq.zip weights
                        |> Seq.map (fun (expectedWeight, (_,actualWeight) )->  
                        ( ((float actualWeight)/(float numberOfUsers)), (expectedWeight/sumWeights) )) 
                        |> Seq.iter (fun (expected, actual ) ->
                        expected |> should (equalWithin samplingError) actual)

[<Fact>]
let ``Use uniform distrubtion with single value``() =
    let calculator = ValueDistribution.compile """{"type": "uniform", "args": ["abc"] }""" 
    calculator [|"userName", 5|]  |> should equal "abc";
    
[<Fact>]
let ``Use weighted distrubtion with single value``() =
    let calculator = ValueDistribution.compile """{"type": "weighted","args": {"5": 1} }""" 
    calculator [|"userName", 5|]  |> should equal "5";

[<Property>]
let ``Use Bernoulli distribution should equal weighted``() =
    let generator = Gen.elements([0.01..0.99]) |> Arb.fromGen
    Prop.forAll generator (fun p -> 
        let q = 1.0-p;
        let weightedInput = (sprintf """{"type": "weighted","args": {"true": %d, "false": %d} }""" (p*100.0 |> int ) (q*100.0 |> int))
        let bernoulliInput = (sprintf """{"type": "bernoulliTrial","args": %.2f }""" p)
        let calculatorWeighted = ValueDistribution.compile weightedInput
        let calculatorBernoulli = ValueDistribution.compile bernoulliInput
        let getValue x = match x with | "true" -> 1 | "false" -> 0 
        let numTests = 1000;
        [|1..numTests|]
            |> Seq.map (fun x -> (calculatorWeighted [|x|], calculatorBernoulli [|x|]))
            |> Seq.fold (fun (accWeighted, accBernoulli) (nextWeighted, nextBernoulli) -> (accWeighted + (getValue nextWeighted), accBernoulli + (getValue nextBernoulli))) (0, 0)
            |> fun (weightedResult, bernoulliResult) -> weightedResult |> should (equalWithin (numTests/20)) bernoulliResult
    )

[<Fact>]
let ``run single tests and verify similar values``()=
    let weights = [|1.0;5.0;6.0|]
    let calculatorWeighted = generatedCalculatedScheme weights
    let totalUsers = 100000
    let samplingError = 0.01
    assertCalculated weights totalUsers samplingError calculatorWeighted

[<Property>]
let ``run many tests and verify similar values``()=
    let gen = Gen.sequence ([Gen.elements([1..10]);
                          Gen.elements([1..10]);
                          Gen.elements([1..10]);
                          ]) |> Arb.fromGen

    let totalUsers = 1000
    let samplingError = 0.06
    Prop.forAll gen (fun test -> 
                        let weights = test |> Seq.map float |> Seq.toArray
                        let calculatorWeighted = generatedCalculatedScheme weights
                        assertCalculated weights totalUsers samplingError calculatorWeighted
    )