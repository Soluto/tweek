namespace Tweek.JPad
open FSharp.Data
open System;

type MultiVarinatDistrubtion = Context -> option<string>
type ValueDistributions = 
    | Single of string
    | Multi of MultiVarinatDistrubtion

type public JPadEvaluate = delegate of ContextDelegate -> Option<string>
type public JPadParser(settings:ParserSettings) = 
    static member private ExtractMatcher(case:JsonValue, settings:ParserSettings) = case.["Matcher"] |> Matcher.Compile(settings)
    static member private ExtractValueDistrubtion(case:JsonValue) = 
        match case.["Type"].AsString() with
                            | "SingleVariant" -> ValueDistributions.Single(case.["Value"].AsString())
                            | "MultiVariant" -> ValueDistributions.Multi(fun (context) -> 
                                let op_owner = case.TryGetProperty("OwnerType") |> Option.bind (fun ownerType -> context <| (ownerType.AsString() + ".@@id"))
                                op_owner |> Option.map (fun owner-> 
                                    [|owner :> Object;case.["Id"].AsString() :> Object|] |> 
                                        ValueDistribution.compile(case.["ValueDistribution"])))
    static member private CreateJPadEvaluate(cases) =
        JPadEvaluate(fun context-> 
            cases |> 
            Array.tryFind(fun (matcher, _)-> matcher(context.Invoke)) |>
            Option.map snd |>
            Option.bind (fun distrubtion-> 
                            match distrubtion with 
                                |Single v -> Some v
                                |Multi fn -> fn context.Invoke)
                                )

    member this.Parse : (string-> JPadEvaluate) = 
        JsonValue.Parse >>
        JsonExtensions.AsArray >>
        Array.map (fun case-> (JPadParser.ExtractMatcher(case, settings), 
                               JPadParser.ExtractValueDistrubtion(case))) >>
        JPadParser.CreateJPadEvaluate