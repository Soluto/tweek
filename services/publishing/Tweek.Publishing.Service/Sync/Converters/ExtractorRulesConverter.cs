using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using Tweek.Publishing.Service.Utils;
using Tweek.Publishing.Service.Validation;

namespace Tweek.Publishing.Service.Sync.Converters
{
    public class ExtractorRulesConverter : IConverter
    {
        private static readonly Regex extractorRulesRegex = new Regex(Patterns.ExtractorRules, RegexOptions.Compiled);
        
        public (string, string, string) Convert(string commitId, ICollection<string> files, Func<string, string> readFn)
        {           
            var result = files
                .Where(x =>  extractorRulesRegex.IsMatch(x))
                .Select(async x => {
                    try
                    {
                        var contents = readFn(x);
                        Validate(contents);
                        return contents;
                    }
                    catch (Exception ex)
                    {
                        ex.Data["key"] = x;
                        throw;
                    }
                })
                .Single();
            return ("security/rules.rego", result.Result, "text/plain");
        }

        private void Validate(string contents)
        {
            string tempFilePath = Path.GetTempFileName();
            try
            {
                File.WriteAllText(tempFilePath, contents);
                var result = ShellHelper.Executor.ExecTask("/tweek/opa", $"check {tempFilePath} -f json").GetAwaiter().GetResult();

            }
            finally
            {
                if (!string.IsNullOrEmpty(tempFilePath) && File.Exists(tempFilePath))
                {
                    File.Delete(tempFilePath);
                }
            }
        }
    }    
}



