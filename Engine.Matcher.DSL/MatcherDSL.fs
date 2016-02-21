namespace Engine.Match.DSL
open FSharp.Data;
open FSharp.Control;

module MatchDSL = 
    
    exception ParseError of string

    type Context = string-> Option<string>

    let isKeyOperator (x:string) = x.[0] = '$'
    let isKeyProperty (x:string) = x.[0] <> '$'

    type LogicalOp = And | Or

    type CompareOp = Equal | GreaterThan | LesserThan | GreaterEqual| LesserEqual
        
    type Op = 
        | CompareOp of CompareOp
        | LogicalOp of LogicalOp

    let parseOp op : Op = match op with
        |"$or" -> Op.LogicalOp(LogicalOp.Or)
        |"$and" -> Op.LogicalOp(LogicalOp.And)
        |"$ge" -> Op.CompareOp(CompareOp.GreaterEqual)
        |"$gt" -> Op.CompareOp(CompareOp.GreaterThan)
        |"$le" -> Op.CompareOp(CompareOp.LesserEqual)
        |"$lt" -> Op.CompareOp(CompareOp.LesserThan)
        | s -> raise (ParseError("expected operator, found:"+s))

    let compareOp = function 
                    | CompareOp.Equal -> (fun a b -> a >= b)
                    | CompareOp.GreaterThan -> (fun a b -> a > b)
                    | CompareOp.LesserThan -> (fun a b -> a < b)
                    | CompareOp.GreaterEqual -> (fun a b -> a >= b)
                    | CompareOp.LesserEqual -> (fun a b -> a <= b)

                    
    let runCompareOp (op: CompareOp) (jsonValue:JsonValue) (stringValue:string) : bool =
        match jsonValue with
            | JsonValue.String x->  compareOp op stringValue x
            | JsonValue.Number x->  compareOp op (stringValue.AsDecimal()) x
            | JsonValue.Boolean x-> compareOp op (stringValue.AsBoolean()) x
            | JsonValue.Float x ->  compareOp op (stringValue.AsFloat()) x
            | JsonValue.Null -> false
            | _ -> false        

    let rec validate (op:Op) (a:JsonValue) (b:string) =
        match op with
            | Op.CompareOp compareOp -> runCompareOp compareOp a b
            | Op.LogicalOp binaryOp-> match binaryOp with
                | LogicalOp.And -> a.Properties() |> Seq.map (fun (key,value)-> validate (parseOp key) value b) |> Seq.reduce (&&)
                | LogicalOp.Or  -> a.Properties() |> Seq.map (fun (key,value)-> validate (parseOp key) value b) |> Seq.reduce (||)

    let reducePredicate op seq = if Seq.isEmpty(seq) then true else seq |> Seq.reduce(op)               

    let rec Match (schema: JsonValue, context: Context, op) : bool =
        (schema.Properties() 
            |> Seq.filter (fun (key,_) -> isKeyProperty(key))
            |> Seq.map (fun (key,schema) -> 
                match context(key) with
                    | Some(x) -> validate (Op.LogicalOp(LogicalOp.And)) schema x
                    | None -> false)
            |> reducePredicate op )
        &&
        (schema.Properties() 
            |> Seq.filter (fun (key,_) -> isKeyOperator(key))
            |> Seq.map (fun (key,schema) -> 
                match parseOp(key) with
                    | Op.LogicalOp logicalOp -> match logicalOp with
                        | LogicalOp.And -> Match(schema, context, (&&))
                        | LogicalOp.Or -> Match(schema, context, (||))
                    | _ -> raise (ParseError("non logical op was used in the wrong place"))
                        )
            |> reducePredicate op)

    
