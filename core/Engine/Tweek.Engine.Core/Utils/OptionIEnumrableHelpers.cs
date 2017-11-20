using LanguageExt;
using System.Collections.Generic;

namespace Tweek.Engine.Core.Utils
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
                return Prelude.Some(item);
            }
            return Prelude.None;
        }
    }
}