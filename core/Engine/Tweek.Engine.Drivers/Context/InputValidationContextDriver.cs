using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using FSharpUtils.Newtonsoft;
using LanguageExt;
using Microsoft.FSharp.Core;
using Newtonsoft.Json;
using Tweek.Utils;
using static System.Tuple;
using static LanguageExt.Prelude;
using Microsoft.Extensions.Logging;
using Tweek.Engine.DataTypes;
using Tweek.Engine.Drivers;
using Unit = LanguageExt.Unit;
using ValidationResult = LanguageExt.Validation<string, LanguageExt.Unit>;
using System.Text.RegularExpressions;

namespace Tweek.Engine.Drivers.Context
{

    public class InputValidationContextDriver : IContextDriver
    {
        public enum Mode
        {
            AllowUndefinedProperties,
            Strict
        }

        public delegate Option<JsonValue> IdentitySchemaProvider(string identityType);
        public delegate Option<CustomTypeDefinition> CustomTypeDefinitionProvider(string typeName);
        public Action<string> OnValidationFailed = (s) => { };

        private static Validation<string, Unit> Valid = Success<string, Unit>(Unit.Default);
        private static Validation<string, Unit> Error(string error) => Fail<string, Unit>(error);

        private readonly IContextDriver _child;
        private readonly IdentitySchemaProvider _identitySchemaProvider;
        private readonly CustomTypeDefinitionProvider _customTypeDefinitionProvider;
        private readonly Mode _mode;
        private readonly bool _reportOnly;

        public InputValidationContextDriver(
            IContextDriver child,
            IdentitySchemaProvider identitySchemaProvider,
            CustomTypeDefinitionProvider customTypeDefinitionProvider,
            Mode mode = Mode.Strict,
            bool reportOnly = false)
        {
            _child = child;
            _identitySchemaProvider = identitySchemaProvider;
            _customTypeDefinitionProvider = customTypeDefinitionProvider ?? (x => None);
            _mode = mode;
            _reportOnly = reportOnly;
        }

        private ValidationResult GetValidationErrors(
            Dictionary<string, JsonValue> context, JsonValue schema) =>
                 context.Where(prop => !prop.Key.StartsWith("@fixed:"))
                        .Select(prop =>
                            schema.GetPropertyOption(prop.Key).Match((propSchema) =>
                                ValidateSingleProperty(prop.Value, propSchema)
                                .Match(s => s, (e) => Error($"{prop.Key}:{String.Join(",", e)}"))
                            , () => _mode == Mode.AllowUndefinedProperties ?
                                 Valid :
                                 Error($"property \"{prop.Key}\" not found in schema"))
                        ).Aggregate(Valid, (a, b) => a | b);

        public async Task AppendContext(Identity identity, Dictionary<string, JsonValue> context)
        {
            var result =
                _identitySchemaProvider(identity.Type)
                .Map(schema => GetValidationErrors(context, schema))
                .IfNone(() => Error($"schema for identity type \"{identity.Type}\" not found"));

            if (result.IsFail)
            {
                string error = $"Invalid properties for {identity.Type}: {String.Join(",", result.FailToSeq())}";
                OnValidationFailed(error);
                if (!_reportOnly)
                {
                    throw new ArgumentException(error);
                }
            }
            await _child.AppendContext(identity, context);
        }

        private ValidationResult ValidateSingleProperty(JsonValue value, JsonValue property)
        {
            return property.GetPropertyOption("type")
                            .Map(typeDefinition =>
                            {
                                switch (typeDefinition)
                                {
                                    case JsonValue.String baseTypeName:
                                        var baseType = baseTypeName.Item;
                                        switch (baseType)
                                        {
                                            case "number": return ValidateNumber(baseType, value);
                                            case "date": return ValidateDate(baseType, value);
                                            case "string": return ValidateString(baseType, value);
                                            case "boolean": return ValidateBoolean(baseType, value);
                                            default:
                                                return _customTypeDefinitionProvider(baseType)
                                               .Map(type => ValidateCustomType(type, value))
                                               .IfNone(() => Error($"custom type \"{baseType}\" not exit"));
                                        }
                                    case JsonValue.Record customTypeRaw:
                                        return ValidateCustomType( CustomTypeDefinition.FromJsonValue(customTypeRaw), value);
                                    default:
                                        return Error("unknown type definition");
                                }
                            }).IfNone(() => Error($"invalid schema"));
        }

        private static ValidationResult ValidateNumber(JsonValue property) =>
            property.IsNumber ? Valid : Error("value is not a number");

        private static ValidationResult ValidateDate(JsonValue property) =>
            DateTime.TryParse(property.AsString(), out var _) ?
                            Valid :
                            Error("value is not a valid date");

        private static ValidationResult ValidateString(JsonValue property) =>
            property.IsString ? Valid :
                                 Error("value is not a string");

        private static ValidationResult ValidateBoolean(JsonValue property) =>
            property.IsBoolean ? Valid :
                                 Error("value is not a boolean value");

        private ValidationResult ValidateCustomType(CustomTypeDefinition typeDefinition, JsonValue property)
        {
            var allowedValuesValidation = !typeDefinition.AllowedValues.Any() || typeDefinition.AllowedValues.Any(v => v.Equals(property)) 
                            ? Valid 
                            : Error("value not in the allowed values");

            var regexValidation = Optional(typeDefinition.Validation)
                         .Map(validation => validation.IsMatch(property.AsString()))
                         .Map(result => result ? Valid : Error("value does not match regex"))
                         .IfNone(Valid);

            return allowedValuesValidation | regexValidation;
        }

        public Task<Dictionary<string, JsonValue>> GetContext(Identity identity) => _child.GetContext(identity);

        public Task RemoveFromContext(Identity identity, string key) => _child.RemoveFromContext(identity, key);
    }
}