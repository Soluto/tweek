using System;
using System.Threading.Tasks;

namespace Tweek.Publishing.Verifier.Validation
{
    public interface IValidator
    {
         Task Validate(string fileName, Func<string, Task<string>> reader);
    }
}