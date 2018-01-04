using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Tweek.JPad;

namespace Tweek.Publishing.Verifier.Validation
{
  public class CompileJPadValidator : IValidator
  {
    JPadParser _parser = new JPadParser(new ParserSettings(
                Comparers: Microsoft.FSharp.Core.FSharpOption<IDictionary<string, ComparerDelegate>>.Some(new Dictionary<string, ComparerDelegate>()
                {

                    ["version"] = Version.Parse
                }), sha1Provider: (s)=>
                {
                    using (var sha1 = System.Security.Cryptography.SHA1.Create())
                    {
                        return sha1.ComputeHash(s);
                    }
                })); 
    public async Task Validate(string fileName, Func<string, Task<string>> reader)
    {
      Console.WriteLine($"compiling {fileName}");
      _parser.Parse.Invoke(await reader(fileName));
    }
  }
}