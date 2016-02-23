using System;
using System.Threading.Tasks;
using LanguageExt;
using LanguageExt.SomeHelp;

namespace Engine
{
    public static class OptionHelpers
    {
        public static Option<T> IfNone<T>(this Option<T> option, Func<Option<T>> altFunc)
        {
            return option.Match(x => x, altFunc);
        }

        public static Task<Option<T>> IfNoneAsync<T>(this Option<T> option, Func<Task<Option<T>>> altFunc)
        {
            return option.MatchAsync(async x => (Option<T>)x, altFunc);
        }

    }
}