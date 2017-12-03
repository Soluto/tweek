using System.IO;
using Microsoft.Extensions.Configuration;

namespace Tweek.Drivers.Rules.Minio
{
    public static class ConfigurationExtention
    {
        public static string GetValueFromEnvOrFile(this IConfiguration configuration, string inlineKey, string fileKey)
        {
            var result = configuration[inlineKey];
            if (!string.IsNullOrEmpty(result)) return result;

            var file = configuration[fileKey];
            return File.Exists(file) ? File.ReadAllText(file) : null;
        }
    }
}
