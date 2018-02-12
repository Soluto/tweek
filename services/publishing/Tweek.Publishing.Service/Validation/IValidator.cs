using System;
using System.Threading.Tasks;

namespace Tweek.Publishing.Service.Validation
{
    public interface IValidator
    {
        Task Validate(string fileName, Func<string, Task<string>> reader);
    }
}