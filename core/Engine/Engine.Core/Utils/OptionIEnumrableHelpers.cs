using System;
using System.Collections.Generic;
using System.Linq;
using LanguageExt;
using LanguageExt.SomeHelp;
using static LanguageExt.Prelude;

namespace Engine.Core.Utils
{
    public static class OptionIEnumrableHelpers
    {
        public static IEnumerable<T> SkipEmpty<T>(this IEnumerable<Option<T>> it)
        {
            foreach (var item in it)
            {
                if (!item.IsNone) yield return item.IfNone(default(T));
            }
        }

        public static Option<T> FirstOrNone<T>(this IEnumerable<T> it)
        {
            foreach (var item in it)
            {
                return Some(item);
            }
            return None;
        }
    }
}