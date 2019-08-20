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
            var result = files
                .Where(x => policyFilesRegex.IsMatch(x))
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
                                Object = x.StartsWith("security/") ? z.Object : GetPolicyObjectForDirPolicyFile(x),
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
                .Aggregate((x, y) => new Policy { Rules = x.Rules.Concat(y.Rules).ToArray() });

            var manifestsRules = files.Where(x => manifestRegex.IsMatch(x)).Select(x =>
            {
                try
                {
                    var manifest = JsonConvert.DeserializeObject<Manifest>(readFn(x));
                    if (manifest.Policy == null)
                    {
                        return new PolicyRule[0];
                    }

                    return manifest.Policy.Map(z =>
                    {
                        return new PolicyRule
                        {
                            Group = z.Group,
                            User = z.User,
                            Effect = z.Effect,
                            Action = z.Action,
                            Object = GetPolicyObjectForKey(x),
                            Contexts = new Dictionary<string, string>()
                        };
                    }).ToArray();
                }
                catch (Exception ex)
                {
                    ex.Data["key"] = x;
                    throw;
                }

            }).Aggregate((x, y) => x.Concat(y).ToArray());

            result.Rules.Concat(manifestsRules);

            return ("security/global-policy.json", JsonConvert.SerializeObject(result), "application/json");
        }
    }
}