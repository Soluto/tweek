namespace FSharpUtils.Newtonsoft
open System
open System.Globalization
open System.Runtime.CompilerServices
open System.Runtime.InteropServices
open Newtonsoft.Json.Linq;
open Newtonsoft.Json;
open Microsoft.FSharp.Core

[<AutoOpen>]
module private Helpers =

  /// Convert the result of TryParse to option type
  let asOption = function true, v -> Some v | _ -> None

  let (|StringEqualsIgnoreCase|_|) (s1:string) s2 = 
    if s1.Equals(s2, StringComparison.OrdinalIgnoreCase) 
      then Some () else None

  let (|OneOfIgnoreCase|_|) set str = 
    if Array.exists (fun s -> StringComparer.OrdinalIgnoreCase.Compare(s, str) = 0) set then Some() else None


type TextConversions private() = 

  static member val DefaultMissingValues = [| "NaN"; "NA"; "N/A"; "#N/A"; ":"; "-"; "TBA"; "TBD" |]

  static member AsString str =
    if String.IsNullOrWhiteSpace str then None else Some str

  static member AsInteger cultureInfo text = 
    Int32.TryParse(text, NumberStyles.Integer, cultureInfo) |> asOption
  
  static member AsInteger64 cultureInfo text = 
    Int64.TryParse(text, NumberStyles.Integer, cultureInfo) |> asOption
  
  static member AsDecimal cultureInfo text =
    Decimal.TryParse(text, NumberStyles.Currency, cultureInfo) |> asOption
  
  /// if useNoneForMissingValues is true, NAs are returned as None, otherwise Some Double.NaN is used
  static member AsFloat missingValues useNoneForMissingValues cultureInfo (text:string) = 
    match text.Trim() with
    | OneOfIgnoreCase missingValues -> if useNoneForMissingValues then None else Some Double.NaN
    | _ -> Double.TryParse(text, NumberStyles.Any, cultureInfo)
           |> asOption
           |> Option.bind (fun f -> if useNoneForMissingValues && Double.IsNaN f then None else Some f)
  
  static member AsBoolean (text:string) =     
    match text.Trim() with
    | StringEqualsIgnoreCase "true" | StringEqualsIgnoreCase "yes" | StringEqualsIgnoreCase "1" -> Some true
    | StringEqualsIgnoreCase "false" | StringEqualsIgnoreCase "no" | StringEqualsIgnoreCase "0" -> Some false
    | _ -> None

type JsonValue =
  | String of string
  | Number of decimal
  | Float of float
  | Record of properties:(string * JsonValue)[]
  | Array of elements:JsonValue[]
  | Boolean of bool
  | Null  

  static member From (token:JToken) = match token.Type with 
       | JTokenType.Float -> JsonValue.Float(token.Value<float>())
       | JTokenType.Integer -> JsonValue.Number(token.Value<int>() |> decimal)
       | JTokenType.Boolean -> JsonValue.Boolean(token.Value<bool>())
       | JTokenType.String -> JsonValue.String(token.Value<string>())
       | JTokenType.Null -> JsonValue.Null
       | JTokenType.Object -> (token :?> JObject).Properties() |> Seq.map (fun x-> (x.Name, JsonValue.From x.Value)) |> Seq.toArray |> JsonValue.Record
       | JTokenType.Array -> (token :?> JArray) |> Seq.map JsonValue.From |> Seq.toArray |> JsonValue.Array
       | JTokenType.Date -> JsonValue.String(token.Value<string>())
       | JTokenType.Uri ->  JsonValue.String(token.Value<string>())
       | JTokenType.Guid -> JsonValue.String(token.Value<string>())
       | _ -> JsonValue.From token.Next

   static member Parse (json) = json |> JToken.Parse |> JsonValue.From

type JsonConversions =

  static member AsString useNoneForNullOrEmpty (cultureInfo:IFormatProvider) = function
    | JsonValue.String s -> if useNoneForNullOrEmpty && String.IsNullOrEmpty s then None else Some s
    | JsonValue.Boolean b -> Some <| if b then "true" else "false"
    | JsonValue.Number n -> Some <| n.ToString cultureInfo
    | JsonValue.Float f -> Some <| f.ToString cultureInfo
    | JsonValue.Null when not useNoneForNullOrEmpty -> Some ""
    | _ -> None

  static member AsInteger cultureInfo = function
    | JsonValue.Number n -> Some <| int n
    | JsonValue.Float n -> Some <| int n
    | JsonValue.String s -> TextConversions.AsInteger cultureInfo s
    | _ -> None

  static member AsInteger64 cultureInfo = function
    | JsonValue.Number n -> Some <| int64 n
    | JsonValue.Float n -> Some <| int64 n
    | JsonValue.String s -> TextConversions.AsInteger64 cultureInfo s
    | _ -> None

  static member AsDecimal cultureInfo = function
    | JsonValue.Number n -> Some n
    | JsonValue.Float n -> Some <| decimal n
    | JsonValue.String s -> TextConversions.AsDecimal cultureInfo s
    | _ -> None

  static member AsFloat missingValues useNoneForMissingValues cultureInfo = function
    | JsonValue.Float n -> Some n
    | JsonValue.Number n -> Some <| float n
    | JsonValue.String s -> TextConversions.AsFloat missingValues useNoneForMissingValues cultureInfo s
    | _ -> None

  static member AsBoolean = function
    | JsonValue.Boolean b -> Some b
    | JsonValue.Number 1M -> Some true
    | JsonValue.Number 0M -> Some false
    | JsonValue.String s -> TextConversions.AsBoolean s
    | _ -> None

[<Extension>]
/// Extension methods with operations on JSON values
type JsonExtensions =

  /// Get a sequence of key-value pairs representing the properties of an object
  [<Extension>]
  static member Properties(x:JsonValue) =
    match x with
      | JsonValue.Record properties -> properties
      | _ -> [| |]

  /// Get property of a JSON object. Fails if the value is not an object
  /// or if the property is not present
  [<Extension>]
  static member GetProperty(x, propertyName) = 
    match x with
    | JsonValue.Record properties -> 
        match Array.tryFind (fst >> (=) propertyName) properties with 
        | Some (_, value) -> value
        | None -> failwithf "Didn't find property '%s' in %s" propertyName <| x.ToString()
    | _ -> failwithf "Not an object: %s" <| x.ToString()

  /// Try to get a property of a JSON value.
  /// Returns None if the value is not an object or if the property is not present.
  [<Extension>]
  static member TryGetProperty(x, propertyName) = 
    match x with
    | JsonValue.Record properties -> 
        Array.tryFind (fst >> (=) propertyName) properties |> Option.map snd
    | _ -> None

  /// Assuming the value is an object, get value with the specified name
  [<Extension>] 
  static member inline Item(x, propertyName) = JsonExtensions.GetProperty(x, propertyName)

  /// Get all the elements of a JSON value.
  /// Returns an empty array if the value is not a JSON array.
  [<Extension>]
  static member AsArray(x:JsonValue) = 
    match x with
    | (JsonValue.Array elements) -> elements
    | _ -> [| |]

  /// Get all the elements of a JSON value (assuming that the value is an array)
  [<Extension>] 
  static member inline GetEnumerator(x) = JsonExtensions.AsArray(x).GetEnumerator()

  /// Try to get the value at the specified index, if the value is a JSON array.
  [<Extension>] 
  static member inline Item(x, index) = JsonExtensions.AsArray(x).[index]

  /// Get the string value of an element (assuming that the value is a scalar)
  /// Returns the empty string for JsonValue.Null
  [<Extension>] 
  static member AsString(x, ?cultureInfo) =
    let cultureInfo = defaultArg cultureInfo  CultureInfo.InvariantCulture
    match JsonConversions.AsString (*useNoneForNullOrEmpty*)false cultureInfo x with
    | Some s -> s
    | _ -> failwithf "Not a string: %s" <| x.ToString()  

  /// Get a number as an integer (assuming that the value fits in integer)
  [<Extension>]
  static member AsInteger(x, ?cultureInfo) = 
    let cultureInfo = defaultArg cultureInfo  CultureInfo.InvariantCulture
    match JsonConversions.AsInteger cultureInfo x with
    | Some i -> i
    | _ -> failwithf "Not an int: %s" <| x.ToString()  

  /// Get a number as a 64-bit integer (assuming that the value fits in 64-bit integer)
  [<Extension>]
  static member AsInteger64(x,  ?cultureInfo) = 
    let cultureInfo = defaultArg cultureInfo  CultureInfo.InvariantCulture
    match JsonConversions.AsInteger64 cultureInfo x with
    | Some i -> i
    | _ -> failwithf "Not an int64: %s" <| x.ToString()  

  /// Get a number as a decimal (assuming that the value fits in decimal)
  [<Extension>]
  static member AsDecimal(x, ?cultureInfo) = 
    let cultureInfo = defaultArg cultureInfo  CultureInfo.InvariantCulture
    match JsonConversions.AsDecimal cultureInfo x with
    | Some d -> d
    | _ -> failwithf "Not a decimal: %s" <| x.ToString()

  /// Get a number as a float (assuming that the value is convertible to a float)
  [<Extension>]
  static member AsFloat(x, ?cultureInfo, ?missingValues) = 
    let cultureInfo = defaultArg cultureInfo  CultureInfo.InvariantCulture
    let missingValues = defaultArg missingValues TextConversions.DefaultMissingValues
    match JsonConversions.AsFloat missingValues (*useNoneForMissingValues*)false cultureInfo x with
    | Some f -> f
    | _ -> failwithf "Not a float: %s" <| x.ToString()

  /// Get the boolean value of an element (assuming that the value is a boolean)
  [<Extension>]
  static member AsBoolean(x) =
    match JsonConversions.AsBoolean x with
    | Some b -> b
    | _ -> failwithf "Not a boolean: %s" <| x.ToString()

