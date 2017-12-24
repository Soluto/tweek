using LanguageExt;
using System;
using Tweek.Engine.Core;
using Tweek.Engine.Core.Context;
using Tweek.Engine.Core.Rules;
using Tweek.Engine.DataTypes;

namespace Tweek.Engine.Tests.Helpers
{
    public class FakeRule : IRule
    {
        private readonly Func<GetContextValue, Option<ConfigurationValue>> _func;

        public FakeRule(Func<GetContextValue, Option<ConfigurationValue>> func)
        {
            _func = func;
        }

        public Option<ConfigurationValue> GetValue(GetContextValue fullContext)
        {
            return _func(fullContext);
        }

        public static IRule Create(Func<GetContextValue, Option<ConfigurationValue>> func)
        {
            return new FakeRule(func);
        }
    }

    public static class RulesRepositoryHelpers
    {
        private static Option<T> GetOneOrMerge<T>(Option<T> l, Option<T> r, Func<T, T, T> merge)
        {
            return Prelude.match(l,
                Some: (lvalue) => Prelude.match(r, Some: (rvalue) => merge(lvalue, rvalue), None: () => lvalue),
                None: () => r);
        }

        public static GetRule Empty()
        {
            return fnPath => Prelude.None;
        }

        public static GetRule With(string path, IRule rule)
        {
            return fnPath => path == fnPath ? Prelude.Some(rule) : Prelude.None;
        }

        public static GetRule Merge(GetRule l, GetRule r)
        {
            return fnPath => GetOneOrMerge(l(fnPath), r(fnPath), (lRule, rRule) => new RuleSet(new[] {lRule, rRule}));
        }

        public static GetRule With(this GetRule target, string path, IRule rule)
        {
            return Merge(target, With(path, rule));
        }
    }
}