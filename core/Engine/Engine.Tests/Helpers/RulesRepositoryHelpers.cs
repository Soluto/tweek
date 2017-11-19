using System;
using Engine.Core;
using Engine.Core.Context;
using Engine.Core.Rules;
using Engine.DataTypes;
using LanguageExt;
using static LanguageExt.Prelude;

namespace Engine.Tests.Helpers
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
            return match(l,
                Some: (lvalue) => match(r, Some: (rvalue) => merge(lvalue, rvalue), None: () => lvalue),
                None: () => r);
        }

        public static RulesRepository Empty()
        {
            return fnPath => None;
        }

        public static RulesRepository With(string path, IRule rule)
        {
            return fnPath => path == fnPath ? Some(rule) : None;
        }

        public static RulesRepository Merge(RulesRepository l, RulesRepository r)
        {
            return fnPath => GetOneOrMerge(l(fnPath), r(fnPath), (lRule, rRule) => new RuleSet(new[] { lRule, rRule }));
        }

        public static RulesRepository With(this RulesRepository target, string path, IRule rule)
        {
            return Merge(target, With(path, rule));
        }
    }
}
