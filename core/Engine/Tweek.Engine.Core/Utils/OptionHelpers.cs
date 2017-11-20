using System;
using System.Threading.Tasks;
using LanguageExt;

namespace Engine.Core.Utils
{
    public static class OptionHelpers
    {
        public static Option<T> IfNone<T>(this Option<T> option, Func<Option<T>> altFunc)
        {
            return option.MatchUnsafe(x => x, altFunc);
        }

        public static Task<Option<T>> IfNoneAsync<T>(this Option<T> option, Func<Task<Option<T>>> altFunc)
        {
            return option.MatchAsync(async x => (Option<T>)x, altFunc);
        }

    }
}