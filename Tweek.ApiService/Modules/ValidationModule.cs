using System;
using System.Collections.Generic;
using System.Linq;
using Nancy;
using Engine.Drivers.Rules;
using System.IO;
using Newtonsoft.Json;
using Engine.Core.Rules;
using System.Web;

namespace Tweek.ApiService.Modules
{
    public class ValidationModule : NancyModule
    {
        IRuleParser parser;

        public bool IsParsable(string payload)
        {
            try
            {
                parser.Parse(payload);
                return true;
            }
            catch { return false; }
        }

        public ValidationModule(IRuleParser parser)
        {
            this.parser = parser;

            Post["/validation", runAsync: true] = async (@params, ct) =>
            {
                Dictionary<string, RuleDefinition> ruleset = null;
                try
                {
                    var raw = await (new StreamReader(Request.Body).ReadToEndAsync());
                    ruleset = JsonConvert.DeserializeObject<Dictionary<string, RuleDefinition>>(raw);
                }
                catch (Exception)
                {
                    throw new HttpException(400, "Invalid ruleset");
                }

                var failures = ruleset
                    .Where(x => !IsParsable(x.Value.Payload))
                    .Select(x => x.Key);

                if (failures.Any()) return failures;
                return true;
            };
        }
    }
}