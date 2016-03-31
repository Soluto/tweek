using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Cassandra;
using Cassandra.Data.Linq;
using Engine.DataTypes;
using Engine.Drivers.Cassandra;
using Engine.Drivers.Context;
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
        
    }
}
