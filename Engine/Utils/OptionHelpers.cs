using System;
using LanguageExt;

namespace Engine
{
    public static class OptionHelpers
    {
        public static Option<T> IfNone<T>(this Option<T> option, Func<Option<T>> altFunc)
        {
            return option.Match(x => x, altFunc);
        }

    }
}