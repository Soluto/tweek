using Engine.Core.Rules;
using LanguageExt;
using Microsoft.FSharp.Core;
using Tweek.Engine.DataTypes;
using static Engine.Core.Rules.Utils;
using static LanguageExt.Prelude;

namespace Tweek.JPad.Utils
{
    public class JPadRulesParserAdapter
    {
        private static Option<T> fs<T>(FSharpOption<T> fsOption) =>
           FSharpOption<T>.get_IsSome(fsOption)
               ? Some(fsOption.Value)
               : None;

        private static FSharpOption<T> ToFSharp<T>(Option<T> option) =>
            option.IsNone
                ? FSharpOption<T>.None
                : match(option,
                     Some: v => FSharpOption<T>.Some(v),
                     None: () => failwith<FSharpOption<T>>("returns null, so can't use the None branch"));

        public static IRuleParser Convert(JPadParser parser)
        {
            return new AnonymousParser((source) =>
            {
                var compiled = parser.Parse.Invoke(source);
                return new AnonymousRule(context =>
                    fs(compiled.Invoke((s) => ToFSharp(context.Invoke(s))))
                            .Map(ConfigurationValue.New));
            });
        }
    }
}
