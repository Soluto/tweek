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
    public class PolicyConverter : IConverter
    {
        private static readonly Regex policyRegex = new Regex(Patterns.Policy, RegexOptions.Compiled);

        private readonly IObjectStorage _client;   

        public PolicyConverter(IObjectStorage storageClient)
        {
            _client = storageClient;  
        }

        public (string, string, string) Convert(string commitId, ICollection<string> files, Func<string, string> readFn)
        {           
            var result = files
                .Where(x =>  policyRegex.IsMatch(x))
                .ToDictionary(x => x, x =>
                {
                    try
                    {
                        return readFn(x);
                    }
                    catch (Exception ex)
                    {
                        ex.Data["key"] = x;
                        throw;
                    }
                });
            return ("policy.csv", result.Values.Single(), "application/csv");
        }
    }
}



