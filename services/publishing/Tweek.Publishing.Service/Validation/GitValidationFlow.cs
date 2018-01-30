using System.Collections.Generic;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Tweek.Publishing.Service.Utils;
using System;
using System.Linq;
using static LanguageExt.Prelude;

namespace Tweek.Publishing.Service.Validation
{
    public class GitValidationFlow
    {
        public List<(string pattern, IValidator IValidator)> Validators = new List<(string pattern, IValidator IValidator)>();
        public async Task Validate(string prevCommit, string newCommit, Func<string,Task<string>> git){
            var files = (await git($"diff --name-status {prevCommit} {newCommit}"))
                            .Split("\n")
                            .Where(x=> !String.IsNullOrWhiteSpace(x))
                            .Select(x=> {
                                var fragments = x.Trim().Split("\t");
                                return (changeType: fragments[0], file: fragments[1]);
                             }) 
                            .Where(x=> x.changeType != "D")
                            .Select(x=> x.file);
                            
                var reader = fun((string s)=> git($"show {newCommit}:\"{s}\""));

                foreach (var file in files){
                    foreach (var (pattern, validator) in Validators){
                        if (Regex.IsMatch(file, pattern)){
                            await validator.Validate(file, reader);
                        }
                    }
                }
        }
    }
}