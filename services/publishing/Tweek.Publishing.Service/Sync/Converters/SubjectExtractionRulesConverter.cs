using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using Tweek.Publishing.Service.Utils;
using Tweek.Publishing.Service.Validation;

namespace Tweek.Publishing.Service.Sync.Converters
{
    public class SubjectExtractionRulesConverter : IConverter
    {
        private static readonly Regex extractorRulesRegex = new Regex(Patterns.SubjectExtractionRules, RegexOptions.Compiled);
    
        public (string, string, string) Convert(string commitId, ICollection<string> files, Func<string, string> readFn)
        {           
            var result = files
                .Where(x =>  extractorRulesRegex.IsMatch(x))
                .Select(x => {
                    try
                    {
                        return readFn(x);
                    }
                    catch (Exception ex)
                    {
                        ex.Data["key"] = x;
                        throw;
                    }
                })
                .Single();
            return ("security/rules.rego", result, "text/plain");
        }
    }
}



