namespace Engine.Match.DSL
open FSharp.Data;
open FSharp.Control;
open System;

module MatchDSL = 
    
    exception ParseError of string

    type Context = string-> Option<string>
    type ContextDelegate = delegate of string-> string

    let nullProtect x = match x with |null -> None |_-> Some x;

    let (|Property|Operator|) (input:string) = if input.[0] = '$' then Operator else Property

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
            | PropertyExprssion of Property * Expression
            | Not of Expression
            | BinaryExpression of LogicalOp * Expression * Expression
            | CompareExpression of CompareOp * Value
            | Empty
            
    type ContextOrValue = 
            | Context of Context
            | Value of Option<String>

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

    let rec compilePropertySchema (logicalOp : LogicalOp) (schema:JsonValue)  : Expression = 
        match schema with 
        | JsonValue.Record record -> record |> 
            Seq.map (fun (key,innerSchema)-> match key with 
                |Property-> Expression.PropertyExprssion(key, innerSchema |> compilePropertySchema LogicalOp.And)
                |Op-> match parseOp(key) with
                    | Op.CompareOp compareOp -> Expression.CompareExpression (compareOp, innerSchema)
                    | Op.LogicalOp binaryOp-> match binaryOp with
                        | LogicalOp.And -> innerSchema |> compilePropertySchema LogicalOp.And
                        | LogicalOp.Or  -> innerSchema |> compilePropertySchema LogicalOp.Or
                        | LogicalOp.Not  -> Expression.Not(innerSchema |> compilePropertySchema LogicalOp.And)
            ) |> reduceOrElse (fun acc exp-> Expression.BinaryExpression(logicalOp, acc, exp)) Expression.Empty
        | x -> Expression.CompareExpression(CompareOp.Equal, x)

    let rec MatchExpression (exp: Expression) (context: ContextOrValue) : bool =
        match exp with
            | PropertyExprssion (prop, innerexp) -> match context with
                | ContextOrValue.Context c -> MatchExpression innerexp (ContextOrValue.Value (prop|>c))
            | Not (innerexp) -> not (MatchExpression innerexp context)
            | BinaryExpression (op, l, r) -> match op with
                |LogicalOp.And -> (MatchExpression l context) && (MatchExpression r context)
                |LogicalOp.Or ->  (MatchExpression l context) || (MatchExpression r context)
            | CompareExpression (op, op_value) -> match context with
                | ContextOrValue.Value actualValueOptional -> match actualValueOptional with
                    |Some actualValue -> evaluateComparison op op_value actualValue
                    |None-> false 
            | Empty -> true

    let compileJsonSchema (schema:JsonValue) = compilePropertySchema LogicalOp.And schema

    let Match_ext_compile (schema: string) : (Func<ContextDelegate, bool>) =
        let json = (JsonValue.Parse(schema))
        let exp = json|> compileJsonSchema;
        new Func<ContextDelegate, bool>(fun c-> MatchExpression exp (ContextOrValue.Context(c.Invoke >> nullProtect)) )

    let Match (schema: JsonValue) (context: Context) : bool =
        ContextOrValue.Context(context) |> ( schema |> compileJsonSchema |> MatchExpression)
    
    let Match_ext (schema: string) (context: ContextDelegate) : bool =
        Match (JsonValue.Parse(schema)) 
               (context.Invoke >> nullProtect)

    