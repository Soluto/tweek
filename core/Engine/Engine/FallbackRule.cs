using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Engine.Core.Context;
using Engine.Core.Rules;
using Engine.Core.Utils;
using Engine.DataTypes;
using LanguageExt;

namespace Tweek.JPad.Rules
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
