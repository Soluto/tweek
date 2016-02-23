namespace Engine.Match.DSL
open FSharp.Data;
open FSharp.Control;

module MatchDSL = 
    
    exception ParseError of string

    type Context = string-> Option<string>

    let (|Property|Operator|) (input:string) = if input.[0] = '$' then Operator else Property

    let private reducePredicate op seq = if Seq.isEmpty(seq) then true else seq |> Seq.reduce(op)               

    type LogicalOp = And | Or

    type CompareOp = Equal | GreaterThan | LesserThan | GreaterEqual | LesserEqual
        
    type Op = 
        | CompareOp of CompareOp
        | LogicalOp of LogicalOp

    let parseOp op : Op = match op with
        |"$or" -> Op.LogicalOp(LogicalOp.Or)
        |"$and" -> Op.LogicalOp(LogicalOp.And)
        |"$ge" -> Op.CompareOp(CompareOp.GreaterEqual)
        |"$eq" -> Op.CompareOp(CompareOp.Equal)
        |"$gt" -> Op.CompareOp(CompareOp.GreaterThan)
        |"$le" -> Op.CompareOp(CompareOp.LesserEqual)
        |"$lt" -> Op.CompareOp(CompareOp.LesserThan)
        | s -> raise (ParseError("expected operator, found:"+s))

    let evaluateComparisonOp = function 
                    | CompareOp.Equal -> (fun a b -> a = b)
                    | CompareOp.GreaterThan -> (fun a b -> a > b)
                    | CompareOp.LesserThan -> (fun a b -> a < b)
                    | CompareOp.GreaterEqual -> (fun a b -> a >= b)
                    | CompareOp.LesserEqual -> (fun a b -> a <= b)

    let evaluateComparison (op: CompareOp) (jsonValue:JsonValue) (stringValue:string) : bool =
        match jsonValue with
            | JsonValue.String x->  evaluateComparisonOp op stringValue x
            | JsonValue.Number x->  evaluateComparisonOp op (stringValue.AsDecimal()) x
            | JsonValue.Boolean x-> evaluateComparisonOp op (stringValue.AsBoolean()) x
            | JsonValue.Float x ->  evaluateComparisonOp op (stringValue.AsFloat()) x
            | JsonValue.Null -> false
            | _ -> false        

    let extractProperties (schema:JsonValue) =
            match schema with
                | JsonValue.Record x -> x |> Seq.map (fun (opString, valueToCompare) -> ((parseOp opString), valueToCompare))
                | x -> seq([(Op.CompareOp(CompareOp.Equal), x)])

    let rec validateProperty (op:Op) (schema:JsonValue) (b:string) =
        let validateProperties schema logicalOp = schema |>
                                                  extractProperties |> 
                                                  Seq.map (fun (op,value)-> validateProperty op value b) |>
                                                  reducePredicate logicalOp
        match op with
            | Op.CompareOp compareOp -> evaluateComparison compareOp schema b
            | Op.LogicalOp binaryOp-> 
                match binaryOp with
                | LogicalOp.And -> (&&) |> validateProperties schema
                | LogicalOp.Or  -> (||) |> validateProperties schema 

    let rec private MatchWithOp (op) (schema: JsonValue) (context: Context) : bool =
        (schema.Properties() 
            |> Seq.map (fun (key,schema) -> 
                match key with
                    |Property ->
                        match context(key) with
                        | Some(x) -> validateProperty (Op.LogicalOp(LogicalOp.And)) schema x
                        | None -> false
                    |Op  -> 
                        match (parseOp key) with
                        | Op.LogicalOp logicalOp -> 
                            match logicalOp with
                            | LogicalOp.And -> MatchWithOp (&&) schema context 
                            | LogicalOp.Or -> MatchWithOp (||) schema context 
                        | _ -> raise (ParseError("non logical op was used in the wrong place"))
            ) |> reducePredicate op )

    let rec Match (schema: JsonValue) (context: Context) : bool =
        MatchWithOp (&&) schema context 

    
