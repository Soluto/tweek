using Microsoft.Extensions.Configuration;
using System.IO;

namespace Tweek.Publishing.Service.Utils
{
    public static class ConfigurationExtensions
    {
        public static string GetValueInlineOrFile(this IConfiguration configuration, string keyPrefix) {
            var inline = configuration[$"{keyPrefix}"];
            if ( inline != null) {
                return inline;
            }
            var file = configuration[$"{keyPrefix}Path"];
            if ( file != null) {
                return File.ReadAllText(file);
            }
            return null;
        }
    }
}