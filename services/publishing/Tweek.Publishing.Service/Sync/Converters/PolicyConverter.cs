using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using Tweek.Publishing.Service.Model;
using Tweek.Publishing.Service.Validation;

namespace Tweek.Publishing.Service.Sync.Converters
{
    public class PolicyConverter : IConverter
    {
        private static readonly Regex policyRegex = new Regex(Patterns.Policy, RegexOptions.Compiled);

        public (string, string, string) Convert(string commitId, ICollection<string> files, Func<string, string> readFn)
        {           
            var result = files
                .Where(x =>  policyRegex.IsMatch(x))
                .Select(x =>
                {
                    try
                    {
                        Console.WriteLine($"another policy file policy {x} reads {readFn(x)}");
                        return JsonConvert.DeserializeObject<Policy>(readFn(x));
                    }
                    catch (Exception ex)
                    {
                        ex.Data["key"] = x;
                        throw;
                    }
                })
                .Aggregate((x,y) => new Policy{Policies = x.Policies.Concat(y.Policies).ToArray()});
                // .Single();

            Console.WriteLine($"the result is {result} {JsonConvert.SerializeObject(result)}");
            return ("security/policy.json", JsonConvert.SerializeObject(result), "application/json");
        }
    }
}



