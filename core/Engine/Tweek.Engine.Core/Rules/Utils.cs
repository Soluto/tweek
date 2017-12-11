using FSharpUtils.Newtonsoft;
using LanguageExt;
using Newtonsoft.Json.Linq;
using System;
using Tweek.Engine.Core.Context;
using Tweek.Engine.DataTypes;

namespace Tweek.Engine.Core.Rules
{
    public static class Utils
    {
        public static readonly IRuleParser ConstValueParser = new AnonymousParser(str =>
            Prelude.map(JsonValue.From(JToken.Parse(str)),
                (value) => new AnonymousRule(ctx => ConfigurationValue.New(value))));

        public static readonly IRuleParser LinkedKeyParser = new AnonymousParser(str =>
            new AnonymousRule(ctx => ctx($"keys.{str}").Map(ConfigurationValue.New)));

        public class AnonymousRule : IRule
        {
            private readonly Func<GetContextValue, Option<ConfigurationValue>> fn;

            public AnonymousRule(Func<GetContextValue, Option<ConfigurationValue>> fn)
            {
                this.fn = fn;
            }

            public Option<ConfigurationValue> GetValue(GetContextValue fullContext) => fn(fullContext);
        }

        public class AnonymousParser : IRuleParser
        {
            private readonly Func<string, IRule> fn;

            public AnonymousParser(Func<string, IRule> fn)
            {
                this.fn = fn;
            }

            public IRule Parse(string source) => fn(source);
        }
    }
}