using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Tweek.Engine.Drivers.Rules;

namespace Tweek.Drivers.Rules.Management
{
    public class ManagementRulesDriver : IRulesDriver
    {
        private const string RULESET_PATH = "/ruleset/latest";
        private const string RULESET_LATEST_VERSION_PATH = "/ruleset/latest/version";

        private readonly HttpGet _getter;

        public ManagementRulesDriver(HttpGet getter)
        {
            _getter = getter;
        }

        public async Task<string> GetVersion(CancellationToken cancellationToken = default(CancellationToken))
        {
            var result = await _getter(RULESET_LATEST_VERSION_PATH, cancellationToken);
            return await result.Content.ReadAsStringAsync();
        }

        public async Task<Dictionary<string, RuleDefinition>> GetRuleset(string version, CancellationToken cancellationToken = default(CancellationToken))
        {
            var rulesetResponse = await _getter(RULESET_PATH, cancellationToken);
            var newVersion = rulesetResponse.GetRulesVersion();
            if (!version.Equals(newVersion))
            {
                throw new Exception($"Version mismatch.\nExpected: {version}\nBut was: {newVersion}");
            }
            return await rulesetResponse.ExtractRules();
        }
    }
}
