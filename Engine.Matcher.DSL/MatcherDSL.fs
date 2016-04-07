namespace Engine.Match.DSL
open FSharp.Data;
open FSharp.Control;
open System;
open Microsoft.FSharp.Quotations;

module MatchDSL = 
    
    exception ParseError of string

    type Context = string-> Option<string>
    type ContextDelegate = delegate of string-> string
    type ComparerDelegate = delegate of string-> IComparable
    type ParserSettings = {Comparers: System.Collections.Generic.IDictionary<string,ComparerDelegate>}

    let nullProtect x = match x with |null -> None |_-> Some x;

    let (|KeyProperty|Operator|) (input:string) = if input.[0] = '$' then Operator else KeyProperty

    let private reducePredicate op seq = if Seq.isEmpty(seq) then true else seq |> Seq.reduce(op)               

    let private reduceOrElse reduceFun alt seq = if not (Seq.isEmpty(seq)) then seq|> Seq.reduce reduceFun else alt

    type LogicalOp = And | Or | Not

    type CompareOp = Equal | GreaterThan | LessThan | GreaterEqual | LessEqual | NotEqual
        
    type Op = 
        | CompareOp of CompareOp
        | LogicalOp of LogicalOp
    
    type ComparisonValue = JsonValue

    type PropertyName = string
    
    type Expression = 
            | Property of PropertyName * Expression
            | Not of Expression
            | Binary of LogicalOp * Expression * Expression
            | Compare of CompareOp * ComparisonValue
            | SwitchComparer of string * Expression
            | Empty

    let private parseOp op : Op = match op with
        |"$not" -> Op.LogicalOp(LogicalOp.Not)
        |"$or" -> Op.LogicalOp(LogicalOp.Or)
        |"$and" -> Op.LogicalOp(LogicalOp.And)
        |"$ge" -> Op.CompareOp(CompareOp.GreaterEqual)
        |"$eq" -> Op.CompareOp(CompareOp.Equal)
        |"$gt" -> Op.CompareOp(CompareOp.GreaterThan)
        |"$le" -> Op.CompareOp(CompareOp.LessEqual)
        |"$lt" -> Op.CompareOp(CompareOp.LessThan)
        |"$ne" -> Op.CompareOp(CompareOp.NotEqual)
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
                | ex -> ParseError ("failure in parser") |> raise
            )
        target.CompareTo << fn;
    
    //evaluateComparisonOp op (comparer stringValue x) 0
    let private evaluateComparison (comparer) (op: CompareOp) (jsonValue:ComparisonValue) : (string->bool) =
        match jsonValue with
            | JsonValue.String x -> (comparer x) >> (fun intValue-> evaluateComparisonOp op  intValue 0)
            | JsonValue.Number x -> evaluateComparisonOp op x << decimal
            | JsonValue.Boolean x -> evaluateComparisonOp op x << bool.Parse 
            | JsonValue.Float x ->  evaluateComparisonOp op x << float
            | JsonValue.Null -> (fun _->false)
            | _ -> (fun _->false)

    let rec private parsePropertySchema (logicalOp : LogicalOp) (schema:JsonValue)  : Expression = 
        match schema with 
        | JsonValue.Record record -> 
            let converterType = record |> Seq.tryFind (fst >> (=) "$comparer")
            let filter = (match converterType with |None -> id |Some x -> Seq.filter ((<>) x) )
            let props = record |> 
                filter |>
                Seq.map (fun (key,innerSchema)-> match key with 
                    |KeyProperty-> Expression.Property(key, innerSchema |> parsePropertySchema LogicalOp.And)
                    |Op-> match parseOp(key) with
                        | Op.CompareOp compareOp -> Expression.Compare (compareOp, innerSchema)
                        | Op.LogicalOp binaryOp-> match binaryOp with
                            | LogicalOp.And -> innerSchema |> parsePropertySchema LogicalOp.And
                            | LogicalOp.Or  -> innerSchema |> parsePropertySchema LogicalOp.Or
                            | LogicalOp.Not  -> Expression.Not(innerSchema |> parsePropertySchema LogicalOp.And)
                ) |> reduceOrElse (fun acc exp-> Expression.Binary(logicalOp, acc, exp)) Expression.Empty
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
                    let bOp = (fun op c-> op (lExp c) (rExp c))
                    match op with
                    |LogicalOp.And -> fun c-> (lExp c) && (rExp c)
                    |LogicalOp.Or -> fun c->  (lExp c) || (rExp c)
                | Compare (op, op_value) ->  
                    let comparison = evaluateComparison comparer op op_value;
                    (fun (context: Context) ->  
                    match context(prefix) with
                        |Some actualValue -> comparison actualValue
                        |None-> false)
                | SwitchComparer (newComparer, innerexp) -> match getComparer(newComparer) with
                    | Some inst_comparer -> innerexp|> CompileExpression prefix (createComparer(inst_comparer.Invoke))
                    | None -> ParseError ("missing comparer - " + newComparer) |> raise
                | Empty -> (fun context->true)

        let defaultComparer (l:string) (r:string) = l.CompareTo r
        CompileExpression "" defaultComparer exp

    let parseJsonSchema (schema:JsonValue) = parsePropertySchema LogicalOp.And schema

    let Compile (schema: string) (settings: ParserSettings) =
        ( schema |> JsonValue.Parse |> parseJsonSchema |> (compile_internal settings.Comparers))

    let Compile_Ext (schema: string) (settings: ParserSettings) : (Func<ContextDelegate, bool>) =
        let matcher = Compile schema settings;
        new Func<ContextDelegate, bool>(fun c-> matcher (c.Invoke >> nullProtect))
