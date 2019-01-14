using System;
using System.IO;
using System.Text;

namespace Tweek.Publishing.Helpers
{
    public static class GitKeyHelper
    {
        public static string GetKeyFromEnvironment()
        {
            var keyBase64 = Environment.GetEnvironmentVariable(@"GIT_SERVER_PRIVATE_KEY_INLINE");            
            if (string.IsNullOrEmpty(keyBase64))
            {
                var keyPath = Environment.GetEnvironmentVariable(@"GIT_SERVER_PRIVATE_KEY_PATH");
                if (!string.IsNullOrEmpty(keyPath))
                {
                    return Convert.ToBase64String(Encoding.UTF8.GetBytes(File.ReadAllText(keyPath, Encoding.UTF8)));                    
                }
                throw new Exception("You must set either GIT_SERVER_PRIVATE_KEY_INLINE or GIT_SERVER_PRIVATE_KEY_PATH environment variable");
            }
            return keyBase64;
        }
    }
}