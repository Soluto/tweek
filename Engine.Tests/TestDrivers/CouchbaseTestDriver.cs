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
using System.IO;
using Couchbase.Core;
using LanguageExt;

namespace Engine.Tests.TestDrivers
{
    class InMemoryTestDriver : IRulesDriver
    {
        private Dictionary<string, RuleDefinition> rules;

        public InMemoryTestDriver(Dictionary<string, RuleDefinition> rules)
        {
            this.rules = rules;
        }

        public event Action<IDictionary<string, RuleDefinition>> OnRulesChange;

        public async Task<Dictionary<string, RuleDefinition>> GetAllRules()
        {
            return rules;
        }
    }

    class CouchbaseTestDriver : ITestDriver
    {
        readonly CouchBaseDriver _driver;
        
        public IContextDriver Context => _driver;
        public Func<Task> cleanup = async ()=> {};

        public CouchbaseTestDriver(Cluster cluster, string bucket)
        {
            _driver = new CouchBaseDriver(cluster.OpenBucket, bucket);
            cleanup += async () =>
            {
                if (cluster.IsOpen(bucket)) cluster.CloseBucket(_driver.GetOrOpenBucket()); 
                
            };
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
        }

        public TestScope SetTestEnviornment(Dictionary<Identity, Dictionary<string, string>> contexts, string[] keys, Dictionary<string, RuleDefinition> rules)
        {
            return new TestScope(rules: new InMemoryTestDriver(rules), context: Context, 
                init: () => InsertContextRows(contexts),
                dispose: Flush);
        }
    }
}
