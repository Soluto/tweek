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

        private static string GetPolicyObjectFromFilePath(string path) {
            return path.Replace("implementations/jpad", "repo/keys").Replace("policy.json", "*");
        }

        public (string, string, string) Convert(string commitId, ICollection<string> files, Func<string, string> readFn)
        {           
            var result = files
                .Where(x =>  policyRegex.IsMatch(x))
                .Select(x =>
                {
                    try
                    {
                        var policy = JsonConvert.DeserializeObject<Policy>(readFn(x));
                        policy.Rules = policy.Rules.Map(z =>
                        {
                            return new PolicyRule
                            {
                                Group = z.Group,
                                User = z.User,
                                Effect = z.Effect,
                                Action = z.Action,
                                Object = x.StartsWith("security/") ? z.Object : GetPolicyObjectFromFilePath(x),
                                Contexts = x.StartsWith("security/") ? z.Contexts : new Dictionary<string, string>()
                            };
                        }).ToArray();

                        return policy;
                    }
                    catch (Exception ex)
                    {
                        ex.Data["key"] = x;
                        throw;
                    }
                })
                .Aggregate((x,y) => new Policy{Rules = x.Rules.Concat(y.Rules).ToArray()});

            return ("security/global-policy.json", JsonConvert.SerializeObject(result), "application/json");
        }
    }
}



