namespace Tweek.JPad
open FSharp.Data;
open System;

module Matcher = 

    let nullProtect x = match x with |null -> None |_-> Some x;

    let (|KeyProperty|Operator|) (input:string) = if input.[0] = '$' then Operator else KeyProperty

    let private reducePredicate op seq = if Seq.isEmpty(seq) then true else seq |> Seq.reduce(op)               

    let private reduceOrElse reduceFun alt seq = if not (Seq.isEmpty(seq)) then seq|> Seq.reduce reduceFun else alt

    type ConjuctionOp = And | Or 
    type UnaryOp = Not

    type ArrayOp = In

    type CompareOp = Equal | GreaterThan | LessThan | GreaterEqual | LessEqual | NotEqual 
    
    type Op = 
        | CompareOp of CompareOp
        | ConjuctionOp of ConjuctionOp
        | ArrayOp of ArrayOp
        | Not
        
    type ComparisonValue = JsonValue

    type PropertyName = string
    
    type Expression = 
            | Property of PropertyName * Expression
            | Not of Expression
            | Binary of ConjuctionOp * Expression * Expression
            | Compare of CompareOp * ComparisonValue
            | ArrayTest of ArrayOp * ComparisonValue
            | SwitchComparer of string * Expression
            | Empty

    let private parseOp op : Op = match op with
        |"$not" -> Op.Not
        |"$or" -> Op.ConjuctionOp(ConjuctionOp.Or)
        |"$and" -> Op.ConjuctionOp(ConjuctionOp.And)
        |"$ge" -> Op.CompareOp(CompareOp.GreaterEqual)
        |"$eq" -> Op.CompareOp(CompareOp.Equal)
        |"$gt" -> Op.CompareOp(CompareOp.GreaterThan)
        |"$le" -> Op.CompareOp(CompareOp.LessEqual)
        |"$lt" -> Op.CompareOp(CompareOp.LessThan)
        |"$ne" -> Op.CompareOp(CompareOp.NotEqual)
        |"$in" -> Op.ArrayOp(ArrayOp.In)
        | s -> raise (ParseError("expected operator, found:"+s))

    let private evaluateComparisonOp = function 
                    | CompareOp.Equal -> (fun b a -> a = b)
                    | CompareOp.GreaterThan -> (fun b a -> a > b)
                    | CompareOp.LessThan -> (fun b a -> a < b)
                    | CompareOp.GreaterEqual -> (fun b a -> a >= b)
                    | CompareOp.LessEqual -> (fun b a -> a <= b)
                    | CompareOp.NotEqual -> (fun b a -> a <> b)

    type private comparer = (string)->(string)->int

    let private createComparer (fn:(string-> IComparable)) l = 
        let target = (
            try
                fn(l)
            with
                | ex -> ParseError ("failure in parser value:" + l) |> raise
            )
        target.CompareTo << fn;
    
    let private evaluateComparison (comparer) (op: CompareOp) (jsonValue:ComparisonValue) : (Option<string>->bool) =
        let onNoneReturnFalse fn = function |Some x-> fn x|None -> false
        match jsonValue with
            | JsonValue.String x -> (comparer x) >> (fun intValue-> evaluateComparisonOp op  intValue 0) |> onNoneReturnFalse
            | JsonValue.Number x ->  decimal >> evaluateComparisonOp op x |> onNoneReturnFalse
            | JsonValue.Boolean x -> bool.Parse >> evaluateComparisonOp op x|> onNoneReturnFalse
            | JsonValue.Float x -> float >> evaluateComparisonOp op x |> onNoneReturnFalse
            | JsonValue.Null -> (fun x->x.IsNone) 
            | _ -> (fun _->false)

    let private evaluateArrayTest (comparer) (op: ArrayOp) (jsonValue:ComparisonValue) : (Option<string>->bool) =
        match jsonValue with
            | JsonValue.Array arr -> match op with
                | ArrayOp.In ->  
                let compareItem = evaluateComparison comparer CompareOp.Equal
                (fun contextValue -> arr |> Array.exists (fun item-> compareItem item contextValue ))
            | _ -> (fun _->false)

    let rec private parsePropertySchema (conjuctionOp : ConjuctionOp) (schema:JsonValue)  : Expression = 
        match schema with 
        | JsonValue.Record record -> 
            let converterType = record |> Seq.tryFind (fst >> (=) "$compare")
            let filter = (match converterType with |None -> id |Some x -> Seq.filter ((<>) x) )
            let props = record |> 
                filter |>
                Seq.map (fun (key,innerSchema)-> match key with 
                    |KeyProperty-> Expression.Property(key, innerSchema |> parsePropertySchema ConjuctionOp.And)
                    |Op-> match parseOp(key) with
                        | Op.CompareOp compareOp -> Expression.Compare (compareOp, innerSchema)
                        | Op.ArrayOp arrayOp -> Expression.ArrayTest (arrayOp, innerSchema)
                        | Op.ConjuctionOp binaryOp-> match binaryOp with
                            | ConjuctionOp.And -> innerSchema |> parsePropertySchema ConjuctionOp.And
                            | ConjuctionOp.Or  -> innerSchema |> parsePropertySchema ConjuctionOp.Or
                        | Op.Not  -> Expression.Not(innerSchema |> parsePropertySchema ConjuctionOp.And)
                ) |> reduceOrElse (fun acc exp-> Expression.Binary(conjuctionOp, acc, exp)) Expression.Empty
            match converterType with 
                |Some (_, convertType) -> Expression.SwitchComparer( convertType.AsString(), props)
                |None -> props
        | x -> Expression.Compare(CompareOp.Equal, x)

    let getPropName prefix prop = if prefix = "" then prop else (prefix + "." + prop)

    let private compile_internal (comparers:System.Collections.Generic.IDictionary<string,ComparerDelegate>) exp  = 
        let getComparer s = if comparers.ContainsKey(s) then Some comparers.[s] else None;
        let rec CompileExpression (prefix:string) comparer (exp: Expression)  : (Context) -> bool =
            match exp with
                | Property (prop, innerexp) -> CompileExpression (getPropName prefix prop) comparer innerexp 
                | Not (innerexp) ->  CompileExpression prefix comparer innerexp >> not
                | Binary (op, l, r) -> 
                    let lExp = CompileExpression prefix comparer l;
                    let rExp = CompileExpression prefix comparer r;
                    match op with
                    |ConjuctionOp.And -> fun c-> (lExp c) && (rExp c)
                    |ConjuctionOp.Or -> fun c->  (lExp c) || (rExp c)
                | ArrayTest (op, op_value) ->  
                    (|>) prefix >> evaluateArrayTest comparer op op_value  
                | Compare (op, op_value) ->  
                    (|>) prefix >> evaluateComparison comparer op op_value
                | SwitchComparer (newComparer, innerexp) -> match getComparer(newComparer) with
                    | Some inst_comparer -> innerexp|> CompileExpression prefix (createComparer(inst_comparer.Invoke))
                    | None -> ParseError ("missing comparer - " + newComparer) |> raise
                | Empty -> (fun context->true)

        let defaultComparer (l:string) (r:string) = l.ToLower().CompareTo (r.ToLower())
        CompileExpression "" defaultComparer exp

    let parseJsonSchema (schema:JsonValue) = parsePropertySchema ConjuctionOp.And schema

    let Compile (settings: ParserSettings) (schema: JsonValue) =
        ( schema |> parseJsonSchema |> (compile_internal settings.Comparers))

