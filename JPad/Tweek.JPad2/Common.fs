namespace Tweek.JPad
open System;

type ComparerDelegate = delegate of string-> IComparable
type Context = string-> Option<string>
type ContextDelegate = delegate of string-> Option<string>
type ParserSettings = {Comparers: System.Collections.Generic.IDictionary<string,ComparerDelegate>}
exception ParseError of string
type JPadEvaluate = Context -> Option<string>
