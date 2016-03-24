using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Cassandra;
using Cassandra.Data.Linq;
using Cassandra.Mapping;
using Engine.DataTypes;
using Engine.Drivers.Cassandra;
using Engine.Drivers.Context;
using Engine.Rules.Creation;
using Newtonsoft.Json;
using NUnit.Framework;

namespace Engine.Drivers.Tests
{
    [TestFixture]
    public class CassandraContextDriverTests
    {
        private ISession _session;

        [OneTimeSetUp]
        public async Task CreateSession()
        {
            //Create a cluster instance using 3 cassandra nodes.
            var cluster = Cluster.Builder()
                .WithQueryOptions(new QueryOptions().SetConsistencyLevel(ConsistencyLevel.One))
                .AddContactPoints("dc0vm1tqwdso6zqj26c.eastus.cloudapp.azure.com",
                    "dc0vm0tqwdso6zqj26c.eastus.cloudapp.azure.com")
                .Build();

            //Create connections to the nodes using a keyspace
            _session = cluster.Connect("tweek");
        }

        [Test]
        public async Task GetContext_SingleContext_ReturnsCorrectDictionary()
        {
            var identity = new Identity("device", Guid.NewGuid().ToString());
            var key = "agent-version";
            var value = "1.2.3";

            await InsertContextRow(identity, key, value);

            IContextDriver driver = new CassandraDriver(_session);
            var result = await driver.GetContext(identity);
            Assert.AreEqual(result[key], value);
        }

        [Test]
        public async Task GetContext_TwoContexts_ReturnsDictionaryCorrectDictionary()
        {
            var identity = new Identity("device", Guid.NewGuid().ToString());
            await InsertContextRow(new Identity("device", Guid.NewGuid().ToString()), "some key", "some value");
            await InsertContextRow(identity, "some key", "expected value");

            IContextDriver driver = new CassandraDriver(_session);
            var result = await driver.GetContext(identity);
            Assert.AreEqual(result.Count, 1);
            Assert.AreEqual(result["some key"], "expected value");
        }

        [Test]
        public async Task GetRules_InsertRulesWithSingleKey_ReturnsSimilarRule()
        {
            var rules = CreateRules("some key");
            
            var rulesTable = await ArrangeRulesTable(rules);
            var rows = await rulesTable.ExecuteAsync();

            var expected = JsonConvert.SerializeObject(rules);
            var result = JsonConvert.SerializeObject(rows);
            
            Assert.AreEqual(expected, result);
        }

        [Test]
        public async Task GetRules_InsertRulesWithMultipleKeys_ReturnsSimilarRule()
        {
            var rules = CreateRules();

            var rulesTable = await ArrangeRulesTable(rules);
            var rows = await rulesTable.ExecuteAsync();

            var expected = JsonConvert.SerializeObject(rules.OrderBy(x => x.Order));
            var result = JsonConvert.SerializeObject(rows.OrderBy(x => x.Order));

            Assert.AreEqual(expected, result);
        }

        [Test]
        public async Task GetPaths_InsertPaths_ReturnsCorrectList()
        {
            var paths = Enumerable.Range(0, 9).Select(x => new CassandraDriver.PathRow
            {
                path = Guid.NewGuid().ToString()
            }).ToList();

            await _session.ExecuteAsync(new SimpleStatement("DROP TABLE IF EXISTS tweek.paths"));
            var pathsTable = new Table<CassandraDriver.PathRow>(_session, CassandraDriver.MappingConfiguration);
            pathsTable.CreateIfNotExists();

            await Task.WhenAll(paths.Select(x => pathsTable.Insert(x).ExecuteAsync()));

            var rows = await pathsTable.ExecuteAsync();

            CollectionAssert.AreEquivalent(paths.Select(x => x.path), rows.Select(x => x.path));
        }

        private async Task InsertContextRow(Identity identity, string key, string value)
        {
            var contextTable = new Table<CassandraDriver.ContextRow>(_session, CassandraDriver.MappingConfiguration);
            contextTable.CreateIfNotExists();
            await contextTable.Insert(new CassandraDriver.ContextRow()
            {
                identity_id = identity.Id,
                identity_type = identity.Type,
                key = key,
                value = value
            }).ExecuteAsync();
        }

        private async Task<Table<RuleData>> ArrangeRulesTable(List<RuleData> rules)
        {
            await _session.ExecuteAsync(new SimpleStatement("DROP TABLE IF EXISTS tweek.rules"));
            var rulesTable = new Table<RuleData>(_session, CassandraDriver.MappingConfiguration);
            rulesTable.CreateIfNotExists();

            await Task.WhenAll(rules.Select(x => rulesTable.Insert(x).ExecuteAsync()));

            return rulesTable;
        }

        private static List<RuleData> CreateRules(string key = null)
        {
            return Enumerable.Range(0, 9).Select(x => new RuleData()
            {
                Id = Guid.NewGuid().ToString(),
                Type = Guid.NewGuid().ToString(),
                Order = x,
                Key = key ?? x.ToString(),
                MatcherSchema = Guid.NewGuid().ToString(),
                MultiVariant_OwnerType = Guid.NewGuid().ToString(),
                SingleVariant_Value = Guid.NewGuid().ToString(),
                MultiVariant_ValueDistributionSchema = new Dictionary<DateTimeOffset, string>()
            }).ToList();
        }
    }
}
