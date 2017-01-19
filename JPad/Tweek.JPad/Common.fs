namespace Tweek.JPad
open System;
open FSharp.Data;

type ComparerDelegate = delegate of string -> IComparable
type Context = string-> Option<JsonValue>
type ContextDelegate = delegate of string -> Option<JsonValue>
type ParserSettings = {Comparers: System.Collections.Generic.IDictionary<string,ComparerDelegate>}
exception ParseError of string
type JPadEvaluate = Context -> Option<JsonValue>
