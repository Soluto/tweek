using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Cassandra;
using Cassandra.Data.Linq;
using Engine.Context;
using Engine.Core;
using Engine.Core.Rules;
using Engine.DataTypes;
using Engine.Drivers.Cassandra;
using Engine.Drivers.Context;
using Engine.Drivers.Keys;
using Engine.Drivers.Rules;
using Engine.Keys;
using Engine.Rules;
using Engine.Rules.Creation;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace Engine.Tests
{
    public class TestScope
    {
        private readonly Func<Task> _dispose;
        private readonly ITestDriver _driver;
        private readonly Func<Task> _init;

        public TestScope(ITestDriver driver ,Func<Task> init, Func<Task> dispose)
        {
            _driver = driver;
            _init = init;
            _dispose = dispose;
        }

        public async Task Run(Func<ITweek, Task> test)
        {
            Exception e = null;
            try
            {
                await _init();
                var tweek = new Tweek(ContextByIdentityCreation.FromDriver(_driver.Context),
                                       await PathTraversalCreation.Create(_driver.Keys),
                                       await RulesRetrieverCreator.Create(_driver.Rules));
                await test(tweek);
            }
            catch (Exception ex)
            {
                e = ex;
            }
            await _dispose();
            if (e != null) throw e;
        }
    }

    public interface ITestDriver
    {
        IKeysDriver Keys { get; }
        IContextDriver Context { get; }
        IRulesDriver Rules { get; }
        TestScope SetTestEnviornment(Dictionary<Identity, Dictionary<string, string>> contexts, string[] keys, RuleData[] rules);
    }

    public class CassandraTestDriver : ITestDriver
    {
        private readonly ISession _session;
        public CassandraTestDriver(ISession session)
        {
            _session = session;
            var cassandraDriver = new CassandraDriver(_session);
            Keys = cassandraDriver;
            Context = cassandraDriver;
            Rules = cassandraDriver;
        }
        
        public IKeysDriver Keys { get; private set; }
        public IContextDriver Context { get; private set; }
        public IRulesDriver Rules { get; private set; }
        
        private async Task InsertContextRows(Dictionary<Identity, Dictionary<string, string>> contexts)
        {
            var contextTable = new Table<CassandraDriver.ContextRow>(_session, CassandraDriver.MappingConfiguration);
            contextTable.CreateIfNotExists();
            var data = contexts.SelectMany(
                identity =>
                    identity.Value.Select(
                        context => new CassandraDriver.ContextRow{identity_id = identity.Key.Id, identity_type = identity.Key.Type, key = context.Key, value = context.Value}));
            await Task.WhenAll(data.Select(async (row)=> await contextTable.Insert(row).ExecuteAsync()));
        }

        private async Task InsertPathRows(string[] keys)
        {
            var table = new Table<CassandraDriver.PathRow>(_session, CassandraDriver.MappingConfiguration);
            table.CreateIfNotExists();
            await Task.WhenAll(keys.Select(async (path) => await table.Insert(new CassandraDriver.PathRow() { path = path }).ExecuteAsync()));
        }

        private async Task InsertRuleData(RuleData[] rules)
        {
            var table = new Table<RuleData>(_session, CassandraDriver.MappingConfiguration);
            table.CreateIfNotExists();
            await Task.WhenAll(rules.Select(async (row) => await table.Insert(row).ExecuteAsync()));
        }

        private async Task DropTable(string tableName)
        {
            await _session.ExecuteAsync(new SimpleStatement(string.Format("DROP TABLE IF EXISTS tweek.{0}", tableName)));
        }

        public TestScope SetTestEnviornment(Dictionary<Identity, Dictionary<string, string>> contexts, string[] keys, RuleData[] rules)
        {
            return new TestScope(driver:this, init:  () =>  Task.WhenAll(InsertContextRows(contexts), InsertRuleData(rules), InsertPathRows(keys)), 
                                 dispose: ()=> Task.WhenAll(DropTable("contexts"),DropTable("paths"), DropTable("rules")));
            ;
        }
    }

    public class RuleDataCreator
    {
        private static int _order = 0;

        public static int Order{get { return Interlocked.Increment(ref _order);}}

        public static RuleData CreateSingleVariantRule(string key, string matcher,  string value, string ruleId = null)
        {
            return new RuleData() { Id = ruleId ?? Guid.NewGuid().ToString(), Order = Order, Key = key, MatcherSchema = matcher, SingleVariant_Value = value, Type = "SingleVariant" };
        }

        public static RuleData CreateMultiVariantRule(string key, string matcher, Dictionary<DateTimeOffset, string> valueDistrubtions, string ownerType, string ruleId = null)
        {
            return new RuleData() { Id = ruleId ?? Guid.NewGuid().ToString(), Order = Order, Key = key, MatcherSchema = matcher, MultiVariant_ValueDistributionSchema = valueDistrubtions, MultiVariant_OwnerType = ownerType, Type = "MultiVariant"};
        }
    }

    [TestClass]
    public class EngineTests
    {
        public ITestDriver GeTestDriver()
        {
            var cluster = Cluster.Builder()
                .WithQueryOptions(new QueryOptions().SetConsistencyLevel(ConsistencyLevel.One))
                .AddContactPoints("dc0vm1tqwdso6zqj26c.eastus.cloudapp.azure.com",
                    "dc0vm0tqwdso6zqj26c.eastus.cloudapp.azure.com")
                .Build();

            //Create connections to the nodes using a keyspace
            var session = cluster.Connect("tweek");
            return new CassandraTestDriver(session);
        }

        [TestMethod]
        public async Task Calculate()
        {
            var driver = GeTestDriver();
            var context = new Dictionary<Identity, Dictionary<string, string>>
            {
                {
                    new Identity("device", "1"),
                    new Dictionary<string, string>()
                }
            };

            var paths = new[] {"abc/somepath"};
            var rules = new[]{RuleDataCreator.CreateSingleVariantRule("abc/somepath", matcher: "{}", value: "SomeValue")};
            var scope = driver.SetTestEnviornment(context, paths, rules);
            await scope.Run(async tweek =>
            {
                var val = await tweek.Calculate("abc/_", new HashSet<Identity> { new Identity("device", "1") });
                Assert.AreEqual(val["somepath"].Value, "SomeValue");
            });
        }
    }
}
