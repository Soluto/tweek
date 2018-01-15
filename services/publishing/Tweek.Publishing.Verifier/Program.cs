using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using CliWrap;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Tweek.JPad;
using Tweek.Publishing.Common;
using Tweek.Publishing.Verifier.Validation;
using static LanguageExt.Prelude;

namespace Tweek.Publishing.Verifier
{
    public static class StreamReaderExtensions {
        public static IEnumerable<string> ReadLines(this TextReader reader)
        {
            string line = null;
            while ((line = reader.ReadLine()) != null){
                yield return line;
            };
        }

        public static async Task<List<TOut>> SelectManyAsyncSync<TIn,TOut>(this IEnumerable<TIn> items, Func<TIn,Task<IEnumerable<TOut>>> fn){
            var list = new List<TOut>();
            foreach (var t in items){
                list.AddRange(await fn(t));
            }
            return list;
        }
    }
    
    class Program
    {

        public static IEnumerable<string> ReadLinesFromConsole(){
            string line = null;
            while ((line = Console.ReadLine()) != null){
                yield return line;
            };
        }
        
        async static Task Main(string[] args)
        {
            var git = ShellHelper.CreateCommandExecutor("git");
            Console.WriteLine("validating new push");
            var commits = ReadLinesFromConsole()
                    .Select(change => {
                        var fragments = change.Split(" ");
                        return (OldRev: fragments[0], NewRev: fragments[1]);
                    }).ToList();

            var validators = new (string pattern, IValidator IValidator)[]{
                    ("^manifests/.*\\.json", new CircularDependencyValidator()),
                    ("^implementations/.*\\.jpad", new CompileJPadValidator())
                    };

            foreach (var (OldRev, NewRev) in commits){
                var files = (await git($"diff --name-only {OldRev} {NewRev}"))
                            .Split("\n");

                var reader = fun((String s)=> git($"show {NewRev}:{s}"));

                foreach (var file in files){
                    foreach (var (pattern, validator) in validators){
                        if (Regex.IsMatch(file, pattern)){
                            await validator.Validate(file, reader);
                        }
                    }
                }
            }
        }
    }
}
