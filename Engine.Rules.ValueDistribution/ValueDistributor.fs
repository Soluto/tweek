namespace Engine.Rules.ValueDistribution
open FSharp;
open FSharp.Data;
open System.Security.Cryptography;
open System.Text
open System

module ValueDistribution = 

    let abc = [|0.5f;0.8f|]
    let abcAsInt = abc |> Array.map (((*) 1000.0f)>>int)

    let private uniformCalc (hash) (choices:string[]) = 
        let index  = (hash % (bigint choices.Length)) |> int
        choices.[index]

    let private weightedCalc (hash) (weighted:(string*int)[]) = 
        let selectedItem = hash % (bigint (weighted |> Seq.fold (fun acc (_, w)->  acc + w) 0) ) |> int
        weighted
        |> Seq.scan (fun (_,a) (x,n) -> (x, a+n)) (Seq.head weighted) 
        |> Seq.skipWhile (fun (_, x)-> x < selectedItem)  
        |> Seq.map (fun (x, _) -> x )
        |> Seq.head

    let floatToWeighted = (*) 10000.0 >> int

    let private calc (json:JsonValue) (input: string) = 
        let sha1 = new SHA1CryptoServiceProvider(); 
        let hash = bigint (sha1.ComputeHash (Encoding.UTF8.GetBytes input)).[0..15]
        match json.GetProperty("type").AsString()  with
        | "weighted" -> weightedCalc hash ( json.GetProperty("args").Properties() |> Array.map (fun (k,v)-> (k, v.AsInteger())) )
        | "uniform" ->  uniformCalc hash (json.GetProperty("args").AsArray() |> Array.map (fun x-> x.AsString()))
        | "value" -> json.GetProperty("args").AsString()
        | "coin" -> weightedCalc hash (
                                                 json.GetProperty("args").AsFloat() |>
                                                 (fun(x)-> [|("true",x |> floatToWeighted);("false", (1.0 - x)|>floatToWeighted)|])
                                                 ) 
        | s -> raise (Exception("expected operator, found:"+s))
        
    let CalculateValue (schema:string) ([<ParamArray>] hash : Object[]) = 
        calc (schema |> JsonValue.Parse) (hash |> Seq.map string |>  String.concat ".");