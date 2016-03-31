using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Engine.DataTypes;
using Engine.Drivers.Rules;
using LanguageExt;

namespace Engine.Management.Drivers
{

    public interface IRulesAuthroingDriver
    {
        Task CommitRuleset(ConfigurationPath path, RuleDefinition ruleDefinition, string authorName, string authorEmail, DateTimeOffset creationTime);
    }
}