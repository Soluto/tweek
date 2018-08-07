using System.Collections.Generic;
using FSharpUtils.Newtonsoft;
using LanguageExt;
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
        public delegate Option<CustomTypeDefinition> CustomTypeDefinitionProvider(string typeName);
        private delegate ValidationResult PropertyValidator(JsonValue value);

        public static Validation<string, Unit> Valid = Success<string, Unit>(Unit.Default);
        public static Validation<string, Unit> Error(string error) => Fail<string, Unit>(error);
        public static Provider Create(IReadOnlyDictionary<string, JsonValue> identitySchemas, IReadOnlyDictionary<string, CustomTypeDefinition> customTypes = null, Mode mode = Mode.Strict)
        {
            customTypes = customTypes ?? new Dictionary<string, CustomTypeDefinition>();
            IReadOnlyDictionary<string, Validator> schemaValidators =
                identitySchemas.ToDictionary(x => x.Key, x => CreateSchemaValidator(x.Value, customTypes.TryGetValue, mode));
            return schemaValidators.TryGetValue;
        }
        private static PropertyValidator InvalidPropValidator(string propName) => (JsonValue _) => Error($"Invalid property schema  \"{propName}\" -  missing type");
        public static Validator CreateSchemaValidator(JsonValue schema, CustomTypeDefinitionProvider customTypesProvider, Mode mode)
        {
            IReadOnlyDictionary<string, PropertyValidator> propValidators = schema.Properties()
                    .Map(x=> (name: x.Item1, def: x.Item2 ))
                    .ToDictionary( prop => prop.name,
                    prop => prop.def.GetPropertyOption("type").Match(
                        type => CreateSinglePropertyValidator(type, customTypesProvider),
                        () => InvalidPropValidator(prop.name)));

            return new Validator((string propName, JsonValue propValue) =>
                 propValidators.TryGetValue(propName)
                               .Match(validator => validator(propValue).Match(x=>x, e=> Error($"error validating prop {propName}: {e}")) , () =>
                               mode == Mode.AllowUndefinedProperties ?
                               Valid :
                               Error($"property \"{propName}\" not found")));
        }

        private static PropertyValidator CreateSinglePropertyValidator(JsonValue schema, CustomTypeDefinitionProvider provider)
        {
            switch (schema)
            {
                case JsonValue.String typeName:
                    var type = typeName.Item;

                    var validator = fun((Func<JsonValue, bool> fn) =>
                        new PropertyValidator(x => fn(x) ? Valid : Error($"value is not a {type}")));

                    switch (type)
                    {
                        case "number": return validator(x => x.IsNumber);
                        case "date": return validator(x => DateTime.TryParse(x.AsString(), out var _));
                        case "string": return validator(x => x.IsString);
                        case "boolean": return validator(x => x.IsBoolean);
                        case "array": return validator(x => x.IsArray);
                        case "object": return validator(x => x.IsRecord);
                        default:
                            return provider(type)
                           .Map(customType => CreateCustomTypeValidator(customType))
                           .IfNone(() => (JsonValue value) => Error($"custom type \"{type}\" not exists"));
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
                validators = validators.Append((JsonValue property) => typeDefinition.AllowedValues.Any(v => 
                    (v.IsString && property.IsString && v.AsString().ToLower() == property.AsString().ToLower() ) || 
                        v.Equals(property)) ? Valid : Error($"value {property.ToString()} not in the allowed values"));
            }
            
            var regexValidation = Optional(typeDefinition.Validation)
                         .Map(validation => fun((JsonValue property) =>
                         {
                             var match = validation.IsMatch(property.AsString());
                             return match ? Valid : Error($"value {property.ToString()} does not match regex");
                         }));

            validators = validators.Append(regexValidation);

            return property => validators.Aggregate(Valid, (acc, validator) => acc | validator(property));
        }
    }
}