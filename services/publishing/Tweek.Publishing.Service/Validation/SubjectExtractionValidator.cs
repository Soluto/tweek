using System;
using System.IO;
using System.Threading.Tasks;
using Tweek.Publishing.Service.Utils;

namespace Tweek.Publishing.Service.Validation
{
    public class SubjectExtractionValidator : IValidator
    {
        public async Task Validate(string fileName, Func<string, Task<string>> reader)
        {
            string tempFilePath = Path.GetTempFileName();
            try
            {
                var contents = await reader(fileName);
                await File.WriteAllTextAsync(tempFilePath, contents);
                var opaPath = Environment.GetEnvironmentVariable("OPA_PATH");
                var result = await ShellHelper.Executor.ExecTask(opaPath, $"check {tempFilePath} -f json");

            }
            catch(Exception e)
            {
                Console.WriteLine(e);
                throw new SubjectExtractionRulesValidationException(e);
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