namespace Engine.Rules.ValueDistribution
open FSharp;
open FSharp.Data;
open System.Security.Cryptography;
open System.Text
open System

module ValueDistribution = 

    let private uniformCalc (hash) (choices:string[]) = 
        let index  = (hash % (choices.Length |> uint64)) |> int
        choices.[index]

    let scanWithFirstItem fold seq = seq |> Seq.skip 1 |> Seq.scan fold (Seq.head seq)

    let private weightedCalc (hash) (weighted:(string*int)[]) = 
        let selectedItem = hash % (weighted |> Seq.sumBy snd |> uint64) |> int

        weighted
        |> scanWithFirstItem (fun (p,a) (x,n) -> (x, a+n))
        |> Seq.skipWhile (fun (_, range)-> selectedItem >= range )  
        |> Seq.map fst
        |> Seq.head

    let floatToWeighted = (*) 100.0 >> int

    let private calc (json:JsonValue) (input: string) = 
        let sha1 = new SHA1CryptoServiceProvider(); 
        let hash = BitConverter.ToUInt64(((sha1.ComputeHash (Encoding.UTF8.GetBytes input)).[0..15]), 0)
        match json.GetProperty("type").AsString()  with
        | "uniform" ->  uniformCalc hash (json.GetProperty("args").AsArray() |> Array.map (fun x-> x.AsString()))
        | "weighted" -> weightedCalc hash ( json.GetProperty("args").Properties() |> Array.map (fun (k,v)-> (k, v.AsInteger())) )
        | "bernoulliTrial" -> weightedCalc hash (
                                    json.GetProperty("args").AsFloat() |>
                                    (fun(x)-> [|("true",x |> floatToWeighted);("false", (1.0 - x)|>floatToWeighted)|])) 
        | s -> raise (Exception("expected operator, found:"+s))
        
    let compile (schema:string) =
        let json = schema |> JsonValue.Parse
        let fn = match json.GetProperty("type").AsString() with
        | "uniform" ->  let args = (json.GetProperty("args").AsArray() |> Array.map (fun x-> x.AsString()));
                        (fun hash -> uniformCalc hash args)
        | "weighted" ->  let args = json.GetProperty("args").Properties() |> Array.map (fun (k,v)-> (k, v.AsInteger()));
                         (fun hash -> weightedCalc hash args)
        | "bernoulliTrial" -> let args = json.GetProperty("args").AsFloat() |> (fun(x)-> [|("true",x |> floatToWeighted);("false", (1.0 - x)|>floatToWeighted)|]);
                              (fun hash -> weightedCalc hash args)
        | s -> raise (Exception("expected operator, found:"+s));
        let sha1 = new SHA1CryptoServiceProvider(); 

        (fun (units : Object[])-> 
            let input = units |> Seq.map string |>  String.concat "."
            let hash = BitConverter.ToUInt64(((sha1.ComputeHash (Encoding.UTF8.GetBytes input)).[0..15]), 0)
            fn(hash))

    let CalculateValue (schema:string) ([<ParamArray>] units : Object[]) = 
        units |> (schema |> compile)

    let compile_ext (schema:string) : (Func<Object[], string>) =
        new Func<Object[], string>(compile schema)

