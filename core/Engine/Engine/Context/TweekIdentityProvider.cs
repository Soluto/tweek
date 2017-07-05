using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Engine.DataTypes;
using Engine.Drivers.Rules;

namespace Engine.Context
{
    public class TweekIdentityProvider
    {
        private static readonly Regex IdentityRegex = new Regex(@"^@tweek\/context\/([^\/]+)", RegexOptions.Compiled | RegexOptions.IgnoreCase);

        private HashSet<string> _identities;
        private TweekIdentityProvider(IRulesDriver driver, HashSet<string> initialIdentities)
        {
            _identities = initialIdentities;

            driver.OnRulesChange += (newRules) =>
            {
                _identities = GetIdentities(newRules.Keys);
            };
        }

        public HashSet<string> GetIdentities() => _identities;

        public static async Task<TweekIdentityProvider> Create(IRulesDriver driver)
        {
            var allRules = await driver.GetAllRules();
            var initialIdentities = GetIdentities(allRules.Keys);
            return new TweekIdentityProvider(driver, initialIdentities);
        }

        private static HashSet<string> GetIdentities(IEnumerable<string> keys)
        {
            var identities = keys.Select(key => IdentityRegex.Match(key))
                .Select(x => x.Groups[1])
                .Where(x => x.Success)
                .Select(x => x.Value);

            return new HashSet<string>(identities) {Identity.GlobalIdentityType};
        }
    }
}
