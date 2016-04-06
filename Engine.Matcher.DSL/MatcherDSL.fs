namespace Engine.Match.DSL
open FSharp.Data;
open FSharp.Control;
open System;

module MatchDSL = 
    
    exception ParseError of string

    type Context = string-> Option<string>
    type ContextDelegate = delegate of string-> string

    let nullProtect x = match x with |null -> None |_-> Some x;

    let (|KeyProperty|Operator|) (input:string) = if input.[0] = '$' then Operator else KeyProperty

    let private reducePredicate op seq = if Seq.isEmpty(seq) then true else seq |> Seq.reduce(op)               

    let private reduceOrElse reduceFun alt seq = if not (Seq.isEmpty(seq)) then seq|> Seq.reduce reduceFun else alt

    type LogicalOp = And | Or | Not

    type CompareOp = Equal | GreaterThan | LessThan | GreaterEqual | LessEqual
        
    type Op = 
        | CompareOp of CompareOp
        | LogicalOp of LogicalOp

    type Value = JsonValue

    type Property = string
    
    type Expression = 
            | Property of Property * Expression
            | Not of Expression
            | Binary of LogicalOp * Expression * Expression
            | Compare of CompareOp * Value
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
        | s -> raise (ParseError("expected operator, found:"+s))

    let private evaluateComparisonOp = function 
                    | CompareOp.Equal -> (fun a b -> a = b)
                    | CompareOp.GreaterThan -> (fun a b -> a > b)
                    | CompareOp.LessThan -> (fun a b -> a < b)
                    | CompareOp.GreaterEqual -> (fun a b -> a >= b)
                    | CompareOp.LessEqual -> (fun a b -> a <= b)

    let private evaluateComparison (op: CompareOp) (jsonValue:JsonValue) (stringValue:string) : bool =
        match jsonValue with
            | JsonValue.String x ->  evaluateComparisonOp op stringValue x
            | JsonValue.Number x ->  evaluateComparisonOp op (stringValue.AsDecimal()) x
            | JsonValue.Boolean x -> evaluateComparisonOp op (stringValue.AsBoolean()) x
            | JsonValue.Float x ->  evaluateComparisonOp op (stringValue.AsFloat()) x
            | JsonValue.Null -> false
            | _ -> false        

    let rec private parsePropertySchema (logicalOp : LogicalOp) (schema:JsonValue)  : Expression = 
        match schema with 
        | JsonValue.Record record -> record |> 
            Seq.map (fun (key,innerSchema)-> match key with 
                |KeyProperty-> Expression.Property(key, innerSchema |> parsePropertySchema LogicalOp.And)
                |Op-> match parseOp(key) with
                    | Op.CompareOp compareOp -> Expression.Compare (compareOp, innerSchema)
                    | Op.LogicalOp binaryOp-> match binaryOp with
                        | LogicalOp.And -> innerSchema |> parsePropertySchema LogicalOp.And
                        | LogicalOp.Or  -> innerSchema |> parsePropertySchema LogicalOp.Or
                        | LogicalOp.Not  -> Expression.Not(innerSchema |> parsePropertySchema LogicalOp.And)
            ) |> reduceOrElse (fun acc exp-> Expression.Binary(logicalOp, acc, exp)) Expression.Empty
        | x -> Expression.Compare(CompareOp.Equal, x)

    let getPropName prefix prop = if prefix = "" then prop else (prefix + "." + prop)

    let rec private CompileExpression (prefix:string) (exp: Expression)  : (Context) -> bool =
        match exp with
            | Property (prop, innerexp) -> CompileExpression (getPropName prefix prop) innerexp 
            | Not (innerexp) ->  CompileExpression prefix innerexp >> not
            | Binary (op, l, r) -> 
                let lExp = CompileExpression prefix l;
                let rExp = CompileExpression prefix r;
                let bOp = (fun op c-> op (lExp c) (rExp c))
                match op with
                |LogicalOp.And -> fun c-> (lExp c) && (rExp c)
                |LogicalOp.Or -> fun c->  (lExp c) || (rExp c)
            | Compare (op, op_value) ->  (fun (context: Context) ->  
                match context(prefix) with
                    |Some actualValue -> evaluateComparison op op_value actualValue
                    |None-> false)
            | Empty -> (fun context->true)

    let parseJsonSchema (schema:JsonValue) = parsePropertySchema LogicalOp.And schema

    let Match_ext_compile (schema: string) : (Func<ContextDelegate, bool>) =
        let json = (JsonValue.Parse(schema))
        let matcher = json|> parseJsonSchema |> CompileExpression "";
        new Func<ContextDelegate, bool>(fun c-> matcher (c.Invoke >> nullProtect))

    let Match (schema: JsonValue) (context: Context) : bool =
        context |> ( schema |> parseJsonSchema |> CompileExpression "")
    
    let Match_ext (schema: string) (context: ContextDelegate) : bool =
        Match (JsonValue.Parse(schema)) 
               (context.Invoke >> nullProtect)

    