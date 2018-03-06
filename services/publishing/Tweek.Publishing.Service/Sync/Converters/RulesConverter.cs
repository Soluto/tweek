using Minio.Exceptions;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Tweek.Publishing.Service.Model;
using Tweek.Publishing.Service.Model.Rules;
using Tweek.Publishing.Service.Storage;
using Tweek.Publishing.Service.Utils;
using Tweek.Publishing.Service.Validation;

namespace Tweek.Publishing.Service.Sync.Converters
{
    public class RulesConverter : IConverter
    {
        private static readonly Regex manifestRegex = new Regex(Patterns.Manifests, RegexOptions.Compiled);

        private readonly IObjectStorage _client;

        public RulesConverter(IObjectStorage storageClient)
        {
            _client = storageClient;
        }

        public (string, string, string) Convert(string commitId, ICollection<string> files, Func<string, string> readFn)
        {            
            var result = files.Where(x => manifestRegex.IsMatch(x))
                .Select(x =>
                {
                    try
                    {
                        return JsonConvert.DeserializeObject<Manifest>(readFn(x));
                    }
                    catch (Exception ex)
                    {
                        ex.Data["key"] = x;
                        throw;
                    }
                })
                .Select(manifest =>
                {
                    var keyDef = new KeyDef
                    {
                        Format = manifest.Implementation.Format ?? manifest.Implementation.Type,
                        Dependencies = manifest.GetDependencies()
                    };
                  
                    switch (manifest.Implementation.Type)
                    {
                        case "file":
                            keyDef.Payload =
                                readFn(manifest.GetFileImplementionPath());
                            break;
                        case "const":
                            keyDef.Payload = JsonConvert.SerializeObject(manifest.Implementation.Value);
                            break;
                        case "alias":
                            keyDef.Payload = manifest.Implementation.Key;
                            break;
                    }
                    return (keyPath:manifest.KeyPath, keyDef: keyDef);
                })
                .ToDictionary(x => x.keyPath, x => x.keyDef);

            return (commitId, JsonConvert.SerializeObject(result), @"application/json");
        }
    }
}



