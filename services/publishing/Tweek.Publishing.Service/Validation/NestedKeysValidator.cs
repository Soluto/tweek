using System;
using System.IO;
using System.Threading.Tasks;

namespace Tweek.Publishing.Service.Validation
{
    public class NestedKeysValidator : IValidator
    {
        public async Task Validate(string filePath, Func<string, Task<string>> reader)
        {
            var currentFilePath = Path.GetDirectoryName(filePath);
            
            while (currentFilePath != "manifests" && !string.IsNullOrEmpty(currentFilePath))
            {
                try
                {
                    await reader(Path.ChangeExtension(currentFilePath, "json"));
                    throw new NestedKeysException(filePath);
                }
                catch (Exception ex) when (!(ex is NestedKeysException)) 
                {
                    // File doesn't exist, all good
                }
                
                currentFilePath = Path.GetDirectoryName(currentFilePath);
            }
        }
    }
    
    public class NestedKeysException : Exception
    {
        public NestedKeysException(string message) : base(message)
        {
        }
    }
}