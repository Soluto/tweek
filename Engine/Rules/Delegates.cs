using System.Collections.Generic;
using Engine.Core.Context;
using Engine.Core.Rules;
using Engine.DataTypes;
using LanguageExt;

namespace Engine.Rules
{
    public delegate Option<ConfigurationValue> CalculateRules(List<IRule> rules, GetLoadedContextByIdentityType getLoadedContext);
}
