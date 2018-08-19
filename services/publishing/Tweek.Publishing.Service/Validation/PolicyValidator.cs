using System;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Tweek.Publishing.Service.Validation
{
    public class PolicyValidator : IValidator
    {
        public async Task Validate(string fileName, Func<string, Task<string>> reader)
        {
            try
            {
                var policyData = await reader(fileName);
                var json = JToken.Parse(policyData);
                if (json["policies"]?.Type != JTokenType.Array)
                {
                    throw new Exception("invalid json");
                }
            }
            catch (Exception e)
            {
                throw new PolicyValidationException(e);
            }
        }
    }
}