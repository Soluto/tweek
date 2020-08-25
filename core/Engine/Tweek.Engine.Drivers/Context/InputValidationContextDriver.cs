using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using FSharpUtils.Newtonsoft;
using LanguageExt;
using Microsoft.FSharp.Core;
using Newtonsoft.Json;
using static System.Tuple;
using static LanguageExt.Prelude;
using Microsoft.Extensions.Logging;
using Tweek.Engine.DataTypes;
using Tweek.Engine.Drivers;
using Unit = LanguageExt.Unit;
using ValidationResult = LanguageExt.Validation<string, LanguageExt.Unit>;
using System.Text.RegularExpressions;
using static Tweek.Engine.Drivers.Context.SchemaValidation;

namespace Tweek.Engine.Drivers.Context
{

    public class InputValidationContextDriver : IContextDriver
    {
        public Action<string> OnValidationFailed = (s) => { };
        private readonly IContextDriver _child;
        private readonly SchemaValidation.Provider _validatorsProvider;
        private readonly bool _reportOnly;

        public InputValidationContextDriver(
            IContextDriver child,
            SchemaValidation.Provider validatorsProvider,
            bool reportOnly = false)
        {
            _child = child;
            _validatorsProvider = validatorsProvider;
            _reportOnly = reportOnly;
        }

        private ValidationResult GetValidationErrors(
            Dictionary<string, JsonValue> context, SchemaValidation.Validator validator) =>
                 context.Where(prop => !prop.Key.StartsWith("@fixed:"))
                        .Select(prop => validator(prop.Key, prop.Value))
                        .Aggregate(Valid, (a, b) => a | b);

        public async Task AppendContext(Identity identity, Dictionary<string, JsonValue> context)
        {
            var result = 
                _validatorsProvider(identity.Type)
                .Map(validator => GetValidationErrors(context, validator))
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

        public Task<Dictionary<string, JsonValue>> GetContext(Identity identity) => _child.GetContext(identity);

        public Task RemoveFromContext(Identity identity, string key) => _child.RemoveFromContext(identity, key);

        public Task DeleteContext(Identity identity) => _child.DeleteContext(identity);
    }
}