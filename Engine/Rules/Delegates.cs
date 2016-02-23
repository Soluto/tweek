using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Engine.Context;
using LanguageExt;

namespace Engine.Rules
{
    public delegate Task<Option<ConfigurationValue>> CalculateRules(List<Rule> rules, ContextRetrieverByIdentityType context);
    public delegate List<Rule> RulesRetriever(ConfigurationPath path);
}
