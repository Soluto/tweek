using Minio.Exceptions;
using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Tweek.Publishing.Service.Model;
using Tweek.Publishing.Service.Storage;
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
                .Select(x=> {
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
            return ("rules.rego", result, "text/plain");
        }
    }
}



