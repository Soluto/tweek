namespace Engine.Match.DSL

type Class1() = 
    member this.X = "F#" 

module ops =
    let op_ge (a:'a, b:'a) = b >= a
    let op_eq (a:'a, b:'a) = a = b
    let op_le (a:'a, b:'a) = b <= a
    let op_lt (a:'a, b:'a) = b < a
    let op_gt (a:'a, b:'a) = b > a


(*
module matcher =
    /*
    let ops_map = [ "$ge", ops.op_ge;
                    "$eq", ops.op_eq; 
                    "$le", ops.op_le; 
                    "$lt", ops.op_lt; 
                    "$gt", ops.op_gt; 
                  ]|> Map.ofList;

    ops.op_ge("a","b");
    ops.op_ge(1, 2);
    //ops_map.Item("$ge")(5,5);
    //ops_map.Item("$ge")("abc","def");
    //ops_map.Item("$ge")(5,5);

*)