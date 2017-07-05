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
        private static readonly Regex IdentityWithAuthRegex = new Regex(@"^@tweek\/auth\/([^\/]+)", RegexOptions.Compiled | RegexOptions.IgnoreCase);

        private HashSet<string> _identitiesWithAuth;
        private TweekIdentityProvider(IRulesDriver driver, HashSet<string> initialIdentitiesWithAuth)
        {
            _identitiesWithAuth = initialIdentitiesWithAuth;

            driver.OnRulesChange += (newRules) =>
            {
                _identitiesWithAuth = ExtractIdentitiesWithAuth(newRules.Keys);
            };
        }

        public HashSet<string> GetIdentitiesWithAuth() => _identitiesWithAuth;

        public static async Task<TweekIdentityProvider> Create(IRulesDriver driver)
        {
            var allRules = await driver.GetAllRules();
            var initialIdentities = ExtractIdentitiesWithAuth(allRules.Keys);
            return new TweekIdentityProvider(driver, initialIdentities);
        }

        private static HashSet<string> ExtractIdentitiesWithAuth(IEnumerable<string> keys)
        {
            var identities = keys.Select(key => IdentityWithAuthRegex.Match(key))
                .Select(x => x.Groups[1])
                .Where(x => x.Success)
                .Select(x => x.Value);

            return new HashSet<string>(identities) {Identity.GlobalIdentityType};
        }
    }
}
