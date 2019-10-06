using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using Newtonsoft.Json;
using Tweek.Publishing.Service.Model;
using Tweek.Publishing.Service.Model.Rules;
using Tweek.Publishing.Service.Validation;

namespace Tweek.Publishing.Service.Sync.Converters
{
    public class PolicyConverter : IConverter
    {
        private static readonly Regex securityPolicyRegex = new Regex(Patterns.SecurityPolicy, RegexOptions.Compiled);
        private static readonly Regex policyFilesRegex = new Regex(Patterns.PolicyFiles, RegexOptions.Compiled);
        private static readonly Regex manifestRegex = new Regex(Patterns.Manifests, RegexOptions.Compiled);

        private static string GetPolicyObjectForDirPolicyFile(string path)
        {
            return path.Replace("manifests", "repo/keys").Replace(".policy.json", "*");
        }

        private static string GetPolicyObjectForKey(string path)
        {
            return path.Replace("manifests", "repo/keys").Replace(".json", "");
        }

        public (string, string, string) Convert(string commitId, ICollection<string> files, Func<string, string> readFn)
        {
            var securityPolicy = files
                .Where(x=> securityPolicyRegex.IsMatch(x))
                .Select(x => {
                    try {
                        return JsonConvert.DeserializeObject<Policy>(readFn(x));
                    } 
                    catch (Exception ex) {
                        ex.Data["key"] = x;
                        throw;
                    }
                })
                .Single();

            var policyFilesRules = files
                .Where(x =>  policyFilesRegex.IsMatch(x))
                .Select(x =>
                {
                    try
                    {
                        var policy = JsonConvert.DeserializeObject<Policy>(readFn(x));
                        return policy.Rules.Map(y =>
                            new PolicyRule
                            {
                                Group = y.Group,
                                User = y.User,
                                Effect = y.Effect,
                                Action = y.Action,
                                Object = x.StartsWith("security/") ? y.Object : GetPolicyObjectForDirPolicyFile(x),
                                Contexts = x.StartsWith("security/") ? y.Contexts : new Dictionary<string, string>()
                            }
                        ).ToArray();
                    }
                    catch (Exception ex)
                    {
                        ex.Data["key"] = x;
                        throw;
                    }
                }).Aggregate(new PolicyRule[]{}, (x, y) => {
                    var rules = new PolicyRule[]{};
                    rules.Concat(x);
                    rules.Concat(y);
                    
                    return rules;
                });

            var manifestsRules = files
                .Where(x => manifestRegex.IsMatch(x))
                .Select(x =>
                {
                    try
                    {
                        var manifest = JsonConvert.DeserializeObject<Manifest>(readFn(x));
                        if (manifest.Policy == null)
                        {
                            return new PolicyRule[]{};
                        }

                        return manifest.Policy.Map(y =>
                        new PolicyRule
                        {
                            Group = y.Group,
                            User = y.User,
                            Effect = y.Effect,
                            Action = y.Action,
                            Object = GetPolicyObjectForKey(x),
                            Contexts = new Dictionary<string, string>()
                        }
                        ).ToArray();
                    }
                    catch (Exception ex)
                    {
                        ex.Data["key"] = x;
                        throw;
                    }

                }).Aggregate(new PolicyRule[]{}, (x, y) => {
                    var rules = new PolicyRule[]{};
                    rules.Concat(x);
                    rules.Concat(y);
                    
                    return rules;
                });
            
            var globalRules = new PolicyRule[]{};
            globalRules.Concat(securityPolicy.Rules);
            globalRules.Concat(policyFilesRules);
            globalRules.Concat(manifestsRules);

            var globalPolicy = new Policy { 
                Rules = globalRules
            };

            return ("security/global-policy.json", JsonConvert.SerializeObject(globalPolicy), "application/json");
        }
    }
}

