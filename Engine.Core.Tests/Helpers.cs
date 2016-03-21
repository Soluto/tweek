using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Engine.Core.Context;
using Engine.Core.DataTypes;
using Engine.Core.Rules;
using LanguageExt;

namespace Engine.Core.Tests
{
    public class FakeRule : IRule
    {
        private Func<GetContextValue, Option<ConfigurationValue>> _func;

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
        public static RulesRepository Empty()
        {
            return (fnPath) => new List<IRule>();
        }

        public static RulesRepository With(string path, params IRule[] rules)
        {
            return (fnPath) => path == fnPath ? rules.ToList() : new List<IRule>();
        }

        public static RulesRepository Merge(RulesRepository l, RulesRepository r)
        {
            return (fnPath) => l(fnPath).Concat(r(fnPath)).ToList();
        }

        public static RulesRepository With(this RulesRepository target, string path, params IRule[] rules)
        {
            return Merge(target, With(path, rules));
        }
    }
    
}
