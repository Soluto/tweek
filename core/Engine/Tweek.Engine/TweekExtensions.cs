using FSharpUtils.Newtonsoft;
using LanguageExt;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Tweek.Engine.Core.Context;
using Tweek.Engine.DataTypes;
using Tweek.Engine.Drivers.Context;
using ContextHelpers = Tweek.Engine.Context.ContextHelpers;
using IdentityHashSet = System.Collections.Generic.HashSet<Tweek.Engine.DataTypes.Identity>;

namespace Tweek.Engine
{
    public static class TweekExtensions
    {
        private static readonly ConfigurationPath Root = ConfigurationPath.New("");
        public static Option<JsonValue> SingleKey(this IDictionary<ConfigurationPath, ConfigurationValue> results) => SingleKey(results, Root);
        public static Option<JsonValue> SingleKey(this IDictionary<ConfigurationPath, ConfigurationValue> results, ConfigurationPath path)
        {
            if (results.ContainsKey(path)) return Prelude.Some(results[path].Value);
            return Prelude.None;
        }

        public static Task<Dictionary<ConfigurationPath, ConfigurationValue>> GetContextAndCalculate(this ITweek tweek,
            ConfigurationPath pathQuery,
            IdentityHashSet identities,
            IContextReader contextDriver,
            GetLoadedContextByIdentityType externalContext = null)
        {
            return tweek.GetContextAndCalculate(new[] { pathQuery }, identities, contextDriver, externalContext);
        }

        public static async Task<Dictionary<ConfigurationPath, ConfigurationValue>> GetContextAndCalculate(this ITweek tweek,
            ICollection<ConfigurationPath> pathQuery,
            IdentityHashSet identities,
            IContextReader contextDriver,
            GetLoadedContextByIdentityType externalContext = null)
        {
            var allContextData = (await Task.WhenAll(identities
                    .Select(async identity => new
                    {
                        Identity = identity,
                        Context = new Dictionary<string, JsonValue>(await contextDriver.GetContext(identity), StringComparer.OrdinalIgnoreCase)
                    })))
                .ToDictionary(x => x.Identity, x => x.Context);

            externalContext = externalContext ?? ContextHelpers.EmptyContextByIdentityType;

            var loadedContexts = ContextHelpers.GetContextRetrieverByType(ContextHelpers.LoadContexts(allContextData), identities);
            var context = ContextHelpers.AddSystemContext(ContextHelpers.Fallback(externalContext, loadedContexts));
            var contextPaths = pathQuery.Any(x => x.IsScan) ? allContextData.Values.SelectMany(x => x.Keys)
                .Where(x => x.Contains("@fixed:"))
                .Select(x => x.Split(':')[1])
                .Where(x=> !String.IsNullOrEmpty(x))
                .Select(ConfigurationPath.New).ToArray() : null;


            return tweek.Calculate(pathQuery, identities, context, contextPaths);
        }

        public static Dictionary<ConfigurationPath, ConfigurationValue> Calculate(this ITweek tweek,
            ConfigurationPath pathQuery,
            IdentityHashSet identities, GetLoadedContextByIdentityType context, ConfigurationPath[] includeFixedPaths = null)
        {
            return tweek.Calculate(new[] { pathQuery }, identities, context, includeFixedPaths);
        }
    }
}
