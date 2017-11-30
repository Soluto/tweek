using LanguageExt;
using Tweek.Engine.Core.Context;
using Tweek.Engine.Core.Rules;
using Tweek.Engine.Core.Utils;
using Tweek.Engine.DataTypes;

namespace Tweek.Engine
{
    public class FallbackRule:IRule
    {
        private readonly IRule _l;
        private readonly IRule _r;

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
