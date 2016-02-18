using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Engine.Context;

namespace Engine.Rules.Matcher
{
    public delegate Matcher MatcherParser(string matcher);
    public delegate bool Matcher(IdentityContext context);
}
