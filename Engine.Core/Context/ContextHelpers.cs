using System;
using System.Collections.Generic;
using System.Linq;
using Engine.Core.Utils;
using Engine.DataTypes;
using LanguageExt;
using LanguageExt.Trans.Linq;
using LanguageExt.Trans;

namespace Engine.Core.Context
{
    public class ContextHelpers
    {
        public static GetContextValue EmptyContext = key=> Option<string>.None;

        internal class FullKey : Tuple<string, string>
        {
            public FullKey(string identityType, string key) : base(identityType, key) { }

            public string IdentityType { get { return Item1; } }
            public string Key { get { return Item2; } }
        }

        internal static Option<FullKey> SplitFullKey(string s)
        {
            var fragments = s.Split('.');
            return fragments.Length == 2
                ? new FullKey(fragments[0], fragments[1])
                : Option<FullKey>.None;
        }

        internal static GetContextValue ContextValueForId(string id)
        {
            return key => key == "@@id" ? id : Option<string>.None;
        }

        internal static GetLoadedContextByIdentityType GetContextRetrieverByType(GetLoadedContextByIdentity getLoadedContexts, HashSet<Identity> identities)
        {
            return type =>
            {
                return
                    identities.Where(x => x.Type == type)
                        .SingleOrNone()
                        .Map(identity => Merge(getLoadedContexts(identity), ContextValueForId(identity.Id)))
                        .IfNone(EmptyContext);

            };
        }

        internal static GetContextValue FlattenLoadedContext(GetLoadedContextByIdentityType getLoadedContext)
        {
            return fullKey =>
                SplitFullKey(fullKey).Bind(fk => getLoadedContext(fk.IdentityType)(fk.Key));
        }

        internal static GetContextFixedConfigurationValue GetFixedConfigurationContext(GetContextValue getContextValue, string identityType)
        {
            return path =>
                getContextValue(identityType + ".@fixed:" + path)
                    .Select(x => new ConfigurationValue(x));
        }

        internal static GetContextValue Merge(GetContextValue a, GetContextValue b)
        {
            return key => a(key).IfNone(() => b(key));
        }
    }
}
