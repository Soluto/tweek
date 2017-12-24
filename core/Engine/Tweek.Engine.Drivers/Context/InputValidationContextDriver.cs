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

namespace Tweek.Engine.Drivers.Context
{
    public class InputValidationContextDriver : IContextDriver
    {
        public enum Mode
        {
            AllowUndefinedProperties,
            Strict
        }
        public static readonly EventId ValidationFailedEventId = new EventId(6754, "ContextInputValidationFailed");
        public delegate Option<JsonValue> IdentitySchemaProvider(string identityType);
        public delegate Option<CustomTypeDefinition> CustomTypeDefinitionProvider(string typeName);
        public event EventHandler<string> OnValidationFailed = (o, s) => {};

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
            this._child = child;
            this._identitySchemaProvider = identitySchemaProvider;
            this._customTypeDefinitionProvider = customTypeDefinitionProvider ?? (x=> None);
            this._mode = mode;
            this._reportOnly = reportOnly;
        }

        public Task AppendContext(Identity identity, Dictionary<string, JsonValue> context)
        {
            var result = 
                _identitySchemaProvider(identity.Type)
                .Map(schema => 
                    {
                      var errors = context.Where(prop => !prop.Key.StartsWith("@fixed:"))
                        .Select(item => new {
                          PropName = item.Key,
                          ValidationResult = ValidateSingleProperty(item, schema)
                          })
                        .Where(item => !item.ValidationResult.isValid);
                      
                      if (!errors.Any()) {
                        return (isValid: true, validationError: "");
                      }

                      var errorsAsString = string.Join(",", errors.Select(error => error.ValidationResult.validationError));

                      var invalidProperties = string.Join(",", errors.Select(error => error.PropName));

                      return (isValid: false, validationError: $"Validation for identity type \"{identity.Type}\" failed because the following properties are invalid: {invalidProperties}");
                    }
                )
                .IfNone((isValid: false, validationError: $"schema for identity type \"{identity.Type}\" not found"));

            if (!result.isValid)
            {
                OnValidationFailed(this, result.validationError);
                if (!_reportOnly)
                {
                    throw new ArgumentException(result.validationError);
                }
            }
            
            return _child.AppendContext(identity, context);
        }

        private (bool isValid, string validationError) ValidateSingleProperty(KeyValuePair<string, JsonValue> item, JsonValue schema)
        {
            (bool isValid, string validationError) CustomTypeValidator(string customTypeName, JsonValue property)
            {
                return _customTypeDefinitionProvider(customTypeName)
                     .Map(type => ValidateCustomType(customTypeName, type, property))
                     .IfNone(() => (false, $"Custom type \"{customTypeName}\" not exit"));
            }

            return schema.GetPropertyOption(item.Key)
                            .Bind(propDefinition => propDefinition.GetPropertyOption("type"))
                            .Map(typeDefinition => new {
                                typeDefinition,
                                propName = item.Key,
                                propValue = item.Value
                            })
                            .Map(propToValidate => {
                                switch(propToValidate.typeDefinition)
                                {
                                    case JsonValue.String baseTypeName:
                                        return NullableExtensions.ToOption(ValidateBaseType(baseTypeName.AsString(), propToValidate.propValue))
                                                .IfNone(() => CustomTypeValidator(baseTypeName.AsString(), propToValidate.propValue));
                                    case JsonValue.Record customTypeRaw:
                                        return ValidateCustomType("inline", customTypeRaw.Deserialize<CustomTypeDefinition>(), propToValidate.propValue);
                                    default:
                                        return (isValid: false, "unknown type definition");
                                }
                            }).IfNone(() => _mode == Mode.AllowUndefinedProperties ? 
                                 (isValid: true, "" ) :
                                 (isValid: false, $"property \"{item.Key}\" not found in schema"));
        }

        private static (bool isValid, string validationError)? ValidateBaseType(string type, JsonValue property)
        {
            switch(type){
                case "number":
                    return property.IsNumber ? 
                      (isValid: true, validationError: "") : 
                      (isValid: false, validationError: "value is not a number");
                case "date":
                    return DateTime.TryParse(property.AsString(), out var _) ?
                            (isValid: true, validationError: "") : 
                            (isValid: false, validationError: "value is not a valid date");
                case "string":
                    return property.IsString  ? 
                      (isValid: true, validationError: "") : 
                      (isValid: false, validationError: "value is not a string");;
                default:
                    return null;
            }
        }

        private (bool isValid, string validationError) ValidateCustomType(string typeName, CustomTypeDefinition typeDefinition, JsonValue property)
        { 
            Func<JsonValue, (bool isValid, string validationError) > baseTypeValidation = 
                (p) => typeName.Equals(typeDefinition.Base, StringComparison.OrdinalIgnoreCase) ?
                     (isValid: false, $"Base type cannot be from the current type \"{typeName}\"") :
                        ValidateBaseType(typeDefinition.Base, p) ?? 
                        (isValid: false, validationError: "base type not exist");
            Func<JsonValue, (bool isValid, string validationError) > allowedValuesValidation = 
                (p) => (typeDefinition.AllowedValues.Any() ? Some(typeDefinition.AllowedValues) : None)
                            .Map(allowedValues => typeDefinition.Base == "string" && allowedValues.Contains(p.AsString(), StringComparer.InvariantCultureIgnoreCase))
                            .Map(r => r ? (isValid: true, validationError: "") : (isValid: false, validationError: "value not in the allowed values"))
                            .IfNone((isValid: true, validationError: ""));
            Func<JsonValue, (bool isValid, string validationError) > regexValidation = 
                (p) => NullableExtensions.ToOption(typeDefinition.Validation?.IsMatch(p.AsString()))
                         .Map(r => r ? (isValid: true, validationError: "") : (isValid: false, validationError: "value does not match regex"))
                         .IfNone((isValid: true, validationError: ""));

            var results =  new [] {baseTypeValidation(property), allowedValuesValidation(property), regexValidation(property)};

            return results
                .Aggregate((isValid: true, validationError: ""), (aggregation, next) => {
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