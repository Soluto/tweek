namespace Engine.Rules.ValueDistribution
open FSharp;
open FSharp.Data;
open System.Security.Cryptography;
open System.Text
open System

module ValueDistribution = 

    let private uniformCalc (hash) (choices:string[]) = 
        let index  = (hash % (bigint choices.Length)) |> int
        choices.[index]

    let scanWithFirstItem fold seq = seq |> Seq.skip 1 |> Seq.scan fold (Seq.head seq)

    let private weightedCalc (hash) (weighted:(string*int)[]) = 
        let selectedItem = hash % (bigint (weighted |> Seq.sumBy snd )) |> int

        weighted
        |> scanWithFirstItem (fun (p,a) (x,n) -> (x, a+n))
        |> Seq.skipWhile (fun (_, range)-> selectedItem > range )  
        |> Seq.map fst
        |> Seq.head

    let floatToWeighted = (*) 100.0 >> int

    let private calc (json:JsonValue) (input: string) = 
        let sha1 = new SHA1CryptoServiceProvider(); 
        let hash = bigint (sha1.ComputeHash (Encoding.UTF8.GetBytes input)) |> abs
        match json.GetProperty("type").AsString()  with
        | "uniform" ->  uniformCalc hash (json.GetProperty("args").AsArray() |> Array.map (fun x-> x.AsString()))
        | "weighted" -> weightedCalc hash ( json.GetProperty("args").Properties() |> Array.map (fun (k,v)-> (k, v.AsInteger())) )
        | "coin" -> weightedCalc hash (
                                    json.GetProperty("args").AsFloat() |>
                                    (fun(x)-> [|("true",x |> floatToWeighted);("false", (1.0 - x)|>floatToWeighted)|])) 
        | s -> raise (Exception("expected operator, found:"+s))
        
    let CalculateValue (schema:string) ([<ParamArray>] units : Object[]) = 
        calc (schema |> JsonValue.Parse) (units |> Seq.map string |>  String.concat ".");