using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Engine.DataTypes;
using Engine.Drivers.Keys;

namespace Engine.Keys
{
    public delegate HashSet<ConfigurationPath> PathTraversal(ConfigurationPath path);

    public static class Creation
    {
        private static async Task<HashSet<ConfigurationPath>> GetPaths(IKeysDriver driver)
        {
            return new HashSet<ConfigurationPath>((await driver.GetPaths()).Select(ConfigurationPath.New));
        }

        public static async Task<PathTraversal> Create(IKeysDriver driver)
        {
            var paths = await GetPaths(driver);
            driver.OnPathChanges += () =>
            {
                Task.Run(async () =>
                {
                    paths = await GetPaths(driver);
                });
            };
            return (ConfigurationPath query) => new HashSet<ConfigurationPath>(paths.Where(path=>ConfigurationPath.Match(path:path,query:query)));
        }
    }
}
