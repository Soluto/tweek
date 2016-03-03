using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Engine.Context;
using Engine.Core.Context;
using Engine.Core.Rules;
using LanguageExt;

namespace Engine.Rules
{
    public delegate Option<ConfigurationValue> CalculateRules(List<IRule> rules, GetLoadedContextByIdentityType getLoadedContext);
    public delegate List<IRule> RulesRepository(ConfigurationPath path);
}
