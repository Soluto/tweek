using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Engine.DataTypes;
using Engine.Drivers.Context;
using Engine.Drivers.Rules;
using Couchbase;
using Tweek.Drivers.CouchbaseDriver;
using Engine.Drivers.Rules.Git;
using System.IO;
using Couchbase.Core;

namespace Engine.Tests.TestDrivers
{
    class CouchbaseTestDriver : ITestDriver
    {
        readonly Cluster _cluster;
        readonly CouchBaseDriver _driver;
        
        public IContextDriver Context => _driver;
        public Func<Task> cleanup = async ()=> {};

        public CouchbaseTestDriver(Cluster cluster, string bucket)
        {
            _cluster = cluster;
            _driver = new CouchBaseDriver(cluster, bucket);
        }

        async Task InsertRuleData(GitDriver driver, Dictionary<string, RuleDefinition> rules)
        {
            await
                Task.WhenAll(
                    rules.Select(
                        x => driver.CommitRuleset(x.Key, x.Value, "tweekintegrationtests", "tweek@soluto.com", DateTimeOffset.UtcNow)));
        }


        async Task InsertContextRows(Dictionary<Identity, Dictionary<string, string>> contexts)
        {
            cleanup = () => Task.WhenAll(contexts.Select(x => x.Key).Select(_driver.RemoveIdentityContext));

            await Task.WhenAll(
                contexts.Map(x => _driver.AppendContext(x.Key, x.Value)
                ));
        }

       
        async Task Flush()
        {
            await cleanup();
            _driver.Dispose();
        }

        public TestScope SetTestEnviornment(Dictionary<Identity, Dictionary<string, string>> contexts, string[] keys, Dictionary<string, RuleDefinition> rules)
        {
            var gitDriver = new GitDriver(Path.Combine(Path.GetTempPath(), "tweek-rules-tests" + Guid.NewGuid()));

            return new TestScope(rules: gitDriver, context: Context, 
                init: () => Task.WhenAll(InsertContextRows(contexts), InsertRuleData(gitDriver, rules)),
                dispose: Flush);
        }
    }
}
