using System;
using System.Collections.Generic;
using System.Linq;
using LanguageExt;
using LanguageExt.SomeHelp;

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
            try
            {
                return it.First(x => x != null).ToSome();
            }
            catch (InvalidOperationException ex)
            {
                if (ex.Message == "Sequence contains no matching element") return Option<T>.None;
                throw;
            }
        }

        public static Option<T> SingleOrNone<T>(this IEnumerable<T> it)
        {
            try
            {
                return it.Single(x=>x!=null);
            }
            catch (InvalidOperationException ex)
            {
                if (ex.Message == "Sequence contains no matching element") return Option<T>.None;
                throw;
            }
        }
    }
}