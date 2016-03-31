using Engine.Core.Context;
using Engine.Core.Utils;
using Engine.DataTypes;
using LanguageExt;

namespace Engine.Core.Rules
{
    public class FallbackRule:IRule
    {
        private readonly IRule _l;
        private readonly IRule _r;
        public static IRule New(IRule l , IRule r)
        {
            return new FallbackRule(l, r);
        }

        public FallbackRule(IRule l, IRule r)
        {
            _l = l;
            _r = r;
        }

        public Option<ConfigurationValue> GetValue(GetContextValue fullContext)
        {
            return _l.GetValue(fullContext).IfNone(() => _r.GetValue(fullContext));
        }
    }
}
