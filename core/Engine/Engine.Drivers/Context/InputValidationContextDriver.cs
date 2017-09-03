using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Engine.DataTypes;
using FSharpUtils.Newtonsoft;
using LanguageExt;
using Microsoft.FSharp.Core;
using Newtonsoft.Json;
using Tweek.Utils;
using static System.Tuple;
using static LanguageExt.Prelude;
using Microsoft.Extensions.Logging;

namespace Engine.Drivers.Context
{
    public class InputValidationContextDriver : IContextDriver
    {
        public enum Mode
        {
            AllowUndefinedProperties,
            Strict,
            ReportOnly
        }
        public static readonly EventId ValidationFailedEventId = new EventId(6754, "ContextInputValidationFailed");
        public delegate Option<JsonValue> IdentitySchemaProvider(string identityType);
        public delegate Option<CustomTypeDefinition> CustomTypeDefinitionProvider(string typeName);

        private readonly IContextDriver _child;
        private readonly ILogger<InputValidationContextDriver> _logger;
        private readonly IdentitySchemaProvider _identitySchemaProvider;
        private readonly CustomTypeDefinitionProvider _customTypeDefinitionProvider;
        private readonly Mode _mode;
        private readonly bool _reportOnly;

        public InputValidationContextDriver(
            IContextDriver child, 
            ILogger<InputValidationContextDriver> logger,
            IdentitySchemaProvider identitySchemaProvider, 
            CustomTypeDefinitionProvider customTypeDefinitionProvider, 
            Mode mode = Mode.Strict,
            bool reportOnly = false)
        {
            this._child = child;
            this._logger = logger;
            this._identitySchemaProvider = identitySchemaProvider;
            this._customTypeDefinitionProvider = customTypeDefinitionProvider;
            this._mode = mode;
            this._reportOnly = reportOnly;
        }

        public Task AppendContext(Identity identity, Dictionary<string, JsonValue> context)
        {
            var result = 
                _identitySchemaProvider(identity.Type)
                .Map(schema => 
                    context.Where(prop => !prop.Key.StartsWith("@fixed:"))
                        .Select(item => ValidateSingleProperty(item, schema))
                        .Aggregate(Create(true, ""), (aggregation, next) => next.Item1 ? aggregation : next)
                )
                .IfNone(Create(false, $"schema for identity type \"{identity.Type}\" not found"));

            if (!result.Item1)
            {
                if (!_reportOnly)
                {
                    throw new ArgumentException(result.Item2);
                }
                else {
                    _logger.LogWarning(result.Item2);
                }
            }
            
            return _child.AppendContext(identity, context);
        }

        private Tuple<bool, string> ValidateSingleProperty(KeyValuePair<string, JsonValue> item, JsonValue schema)
        {
            Tuple<bool, string> CustomTypeValidator(string customTypeName, JsonValue property)
            {
                return _customTypeDefinitionProvider(customTypeName)
                     .Map(type => ValidateCustomType(customTypeName, type, property))
                     .IfNone(Create(false, $"Custom type \"{customTypeName}\" not exit"));
            }

            Option<T> ToOption<T>(FSharpOption<T> source)
            {
                return (source == null || source.Value == null) ?  None : Some(source.Value);
            }

            return ToOption(schema.TryGetProperty(item.Key))
                            .Bind(propDefinition => ToOption(propDefinition.TryGetProperty("type")))
                            .Map(typeDefinition => new {
                                typeDefinition,
                                propName = item.Key,
                                propValue = item.Value
                            })
                            .Map(propToValidate => {
                                switch(propToValidate.typeDefinition)
                                {
                                    case JsonValue.String baseTypeName:
                                        return ValidateBaseType(baseTypeName.AsString(), propToValidate.propValue)
                                                .Map(validationResult => 
                                                    validationResult ??
                                                    CustomTypeValidator(baseTypeName.AsString(), propToValidate.propValue));
                                    case JsonValue.Record customTypeRaw:
                                        var customType = JsonConvert.DeserializeObject<CustomTypeDefinition> (JsonConvert.SerializeObject(customTypeRaw, new []{new JsonValueConverter()}));
                                        return ValidateCustomType("inline", customType, propToValidate.propValue);
                                    default:
                                        return Create(false, "unknown type definition");
                                }
                            }).IfNone(() => _mode == Mode.AllowUndefinedProperties ? 
                                 Create(true, "" ) :
                                 Create(false, $"property \"{item.Key}\" not found in schema"));
        }

        private static Tuple<bool, string> ValidateBaseType(string type, JsonValue property)
        {
            switch(type){
                case "number":
                    return property.IsNumber ? Create(true, "") : Create(false, "value is not a number");
                case "date":
                    return DateTime.TryParse(property.AsString(), out var _) ?
                            Create(true, "") : Create(false, "value is not a valid date");
                case "string":
                    return property.IsString  ? Create(true, "") : Create(false, "value is not a string");;
                default:
                    return null;
            }
        }

        private Tuple<bool, string> ValidateCustomType(string typeName, CustomTypeDefinition typeDefinition, JsonValue property)
        { 
            Func<JsonValue, Tuple<bool, string>> baseTypeValidation = 
                (p) => typeName.Equals(typeDefinition.Base, StringComparison.OrdinalIgnoreCase) ?
                     Create(false, $"Base type cannot be from the current type \"{typeName}\"") :
                      ValidateBaseType(typeDefinition.Base, p) ?? Create(false, "base type not exist");
            Func<JsonValue, Tuple<bool, string>> allowedValuesValidation = 
                (p) => (typeDefinition.AllowedValues.Any() ? Some(typeDefinition.AllowedValues) : None)
                            .Map(allowedValues => typeDefinition.Base == "string" && allowedValues.Contains(p.AsString()))
                            .Map(r => r ? Create(true, "") : Create(false, "value not in the allowed values"))
                            .IfNone(Create(true, ""));
            Func<JsonValue, Tuple<bool, string>> regexValidation = 
                (p) => NullableExtensions.ToOption(typeDefinition.Validation?.IsMatch(p.AsString()))
                         .Map(r => r ? Create(true, "") : Create(false, "value does not match regex"))
                         .IfNone(Create(true, ""));

            var results =  new [] {baseTypeValidation(property), allowedValuesValidation(property), regexValidation(property)};

            return results
                .Aggregate(Create(true, ""), (aggregation, next) => {
                    return next.Item1 ? aggregation : next;
                    });
        }

        public Task<Dictionary<string, JsonValue>> GetContext(Identity identity)
        {
            return _child.GetContext(identity);
        }

        public Task RemoveFromContext(Identity identity, string key)
        {
            return _child.RemoveFromContext(identity, key);
        }
    }
}