using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using Newtonsoft.Json;
using Tweek.Publishing.Service.Model.ExternalApps;
using Tweek.Publishing.Service.Validation;

namespace Tweek.Publishing.Service.Sync.Converters
{
    public class ExternalAppsConverter : IConverter
    {
        private static readonly Regex externalAppRegex = new Regex(Patterns.ExternalApp, RegexOptions.Compiled);

        private readonly string _key;

        public ExternalAppsConverter(string key)
        {
            _key = key;
        }

        public (string, string, string) Convert(string commitId, ICollection<string> files, Func<string, string> readFn)
        {
            var secretKey = CreateSecretKey(_key);

            var (appId, app) = CreateAdminApp(secretKey);

            var result = files
                .Where(x =>  externalAppRegex.IsMatch(x))
                .ToDictionary(x => externalAppRegex.Match(x).Groups[1].Value, x =>
                {
                    try
                    {
                        return JsonConvert.DeserializeObject<ExternalApp>(readFn(x));
                    }
                    catch (Exception ex)
                    {
                        ex.Data["key"] = x;
                        throw;
                    }
                });
            result.Add(appId, app);

            return (@"external_apps.json", JsonConvert.SerializeObject(result, Formatting.Indented), @"application/json");
        }

        private static byte[] CreateSecretKey(string key)
        {            
            MD5 md5 = System.Security.Cryptography.MD5.Create();

            byte[] inputBytes = Encoding.UTF8.GetBytes(key);

            byte[] hash = md5.ComputeHash(inputBytes);
            return hash;
        }

        private static (string, ExternalApp)  CreateAdminApp(byte[] secretKey)
        {
            string appId = "admin-app";

            var salt = GenerateSalt();            
            byte[] hash;
            using(var pbkdf2 = new Rfc2898DeriveBytes(secretKey, salt,100, HashAlgorithmName.SHA512))
            {
                hash = pbkdf2.GetBytes(512);
            }

            ExternalApp app = new ExternalApp 
            {
                Name = @"Admin App",
                Version = @"0.1.0",
                SecretKeys = new List<SecretKey>
                {
                    new SecretKey
                    {
                        CreationDate = DateTime.Now.ToString(),
                        Salt = ByteArrayToString(salt),
                        Hash = ByteArrayToString(hash),
                    }
                }
            };

            return (appId, app);
        }

        private static byte[] StringToByteArray(string hex) => Enumerable.Range(0, hex.Length)
                     .Where(x => x % 2 == 0)
                     .Select(x => System.Convert.ToByte(hex.Substring(x, 2), 16))
                     .ToArray();

        private static string ByteArrayToString(byte[] ba) => String.Join(String.Empty, ba.Select(b => String.Format("{0:x2}", b)));

        public static byte[] GenerateSalt()
        {
            RNGCryptoServiceProvider rncCsp = new RNGCryptoServiceProvider();
            byte[] salt = new byte[64];
            rncCsp.GetBytes(salt);

            return salt;
        }
    }
}