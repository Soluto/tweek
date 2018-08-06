using System.Collections.Generic;
using FSharpUtils.Newtonsoft;
using LanguageExt;
using static Tweek.Engine.Drivers.Context.InputValidationContextDriver;
using Unit = LanguageExt.Unit;
using ValidationResult = LanguageExt.Validation<string, LanguageExt.Unit>;
using static LanguageExt.Prelude;
using System.Linq;
using System;
using Tweek.Engine.DataTypes;

namespace Tweek.Engine.Drivers.Context
{
    public class SchemaValidation
    {
        public enum Mode
        {
            AllowUndefinedProperties,
            Strict
        }

        public delegate Option<Validator> Provider(string identityType);
        public delegate ValidationResult Validator(string property, JsonValue value);
        private delegate ValidationResult PropertyValidator(JsonValue value);
        public delegate Option<CustomTypeDefinition> CustomTypeDefinitionProvider(string typeName);

        public static Validation<string, Unit> Valid = Success<string, Unit>(Unit.Default);
        public static Validation<string, Unit> Error(string error) => Fail<string, Unit>(error);
        public static Provider Create(Dictionary<string, JsonValue> identitySchemas, IReadOnlyDictionary<string, CustomTypeDefinition> customTypeProvider = null, Mode mode = Mode.Strict) {
                customTypeProvider = customTypeProvider ?? new Dictionary<string, CustomTypeDefinition>();
                IReadOnlyDictionary<string, Validator> schemaValidators = identitySchemas.ToDictionary(x => x.Key, x=> 
                    {
                        IReadOnlyDictionary<string, PropertyValidator> propValidators = x.Value.Properties()
                        .ToDictionary(prop => prop.Item1, 
                        prop => prop.Item2.GetPropertyOption("type").Match(
                            type=>CreateSinglePropertyValidator(type, customTypeProvider.TryGetValue ),
                            ()=> new PropertyValidator((JsonValue _)=> Error($"Invalid property schema  \"{prop.Item1}\" -  missing type"))));

                        return new Validator((string propName, JsonValue propValue) => 
                             propValidators.TryGetValue(propName)
                                           .Match(validator => validator(propValue), ()=> 
                                           mode == Mode.AllowUndefinedProperties ?
                                           Valid :
                                           Error($"property \"{propName}\" not found" )));
                    }
                );
                return schemaValidators.TryGetValue;
            }
        
        private static PropertyValidator CreateSinglePropertyValidator(JsonValue schema, CustomTypeDefinitionProvider provider)
        {
            switch (schema)
            {
                case JsonValue.String baseTypeName:
                    var baseType = baseTypeName.Item;
                    
                    var validator = fun((Func<JsonValue, bool> fn) => 
                        new PropertyValidator(x=>  fn(x) ? Valid : Error($"value is not a {baseType}")));
                    
                    switch (baseType)
                    {
                        case "number":  return validator( x=>x.IsNumber);
                        case "date": return validator(x=> DateTime.TryParse(x.AsString(), out var _));
                        case "string": return validator(x => x.IsString);
                        case "boolean": return validator(x=> x.IsBoolean);
                        case "array": return validator(x=> x.IsArray);
                        case "object": return validator(x=> x.IsRecord);
                        default:
                            return provider(baseType)
                           .Map(type => CreateCustomTypeValidator(type))
                           .IfNone(() => (JsonValue value) => Error($"custom type \"{baseType}\" not exit"));
                    }
                case JsonValue.Record customTypeRaw:
                    return CreateCustomTypeValidator(CustomTypeDefinition.FromJsonValue(customTypeRaw));
                default:
                    return (JsonValue _) => Error("unknown type definition");
            }
        }

        private static PropertyValidator CreateCustomTypeValidator(CustomTypeDefinition typeDefinition)
        {
            var validators = Enumerable.Empty<Func<JsonValue, ValidationResult>>();
            if (typeDefinition.AllowedValues.Any())
            {
                validators = validators.Append((JsonValue property) => !typeDefinition.AllowedValues.Any(v => v.Equals(property)) ? Error("value not in the allowed values") : Valid);
            }
            var regexValidation = Optional(typeDefinition.Validation)
                         .Map(validation => fun((JsonValue property) =>
                         {
                             var match = validation.IsMatch(property.AsString());
                             return match ? Valid : Error("value does not match regex");
                         }));

            validators = validators.Append(regexValidation);

            return property => validators.Aggregate(Valid, (a, b) => a | b(property));
        }
    }
}