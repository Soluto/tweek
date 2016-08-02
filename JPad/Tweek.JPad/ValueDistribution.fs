namespace Tweek.JPad
open FSharp;
open FSharp.Data;
open System.Security.Cryptography;
open System.Text
open System

module ValueDistribution = 

    let private uniformCalc (choices:string[]) (hash) = 
        let index  = (hash % (choices.Length |> uint64)) |> int
        choices.[index]

    let scanWithFirstItem fold seq = seq |> Seq.skip 1 |> Seq.scan fold (Seq.head seq)

    let private weightedCalc (weighted:(string*int)[]) (hash) = 
        let selectedItem = hash % (weighted |> Seq.sumBy snd |> uint64) |> int

        weighted
        |> scanWithFirstItem (fun (_,acc_weight) (next_val,weight) -> (next_val, acc_weight+weight))
        |> Seq.skipWhile (fun (_, range)-> selectedItem >= range )  
        |> Seq.map fst
        |> Seq.head

    let floatToWeighted = (*) 100.0 >> int

    let compile (schema:JsonValue) =
        let fn = match schema.GetProperty("type").AsString() with
        | "uniform" ->  let args = (schema.GetProperty("args").AsArray() |> Array.map (fun x-> x.AsString()));
                        uniformCalc args
        | "weighted" ->  let args = schema.GetProperty("args").Properties() |> Array.map (fun (k,v)-> (k, v.AsInteger()));
                         weightedCalc args
        | "bernoulliTrial" -> let percentage = schema.GetProperty("args").AsFloat() |>floatToWeighted
                              weightedCalc [|("true", percentage);("false", (100 - percentage))|];
        | s -> raise (Exception("expected operator, found:"+s));
        let sha1 = new SHA1CryptoServiceProvider(); 

        (fun (units : Object[])-> 
            let input = units |> Seq.map string |>  String.concat "."
            let hash = BitConverter.ToUInt64(((sha1.ComputeHash (Encoding.UTF8.GetBytes input)).[0..15]), 0)
            fn(hash))


