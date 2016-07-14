using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Cassandra;
using Cassandra.Data.Linq;
using Engine.DataTypes;
using Engine.Drivers.Cassandra;
using Engine.Drivers.Context;
using Engine.Drivers.Rules;
using Engine.Rules.Creation;

namespace Engine.Tests.TestDrivers
{
    public class CassandraTestDriver : ITestDriver
    {
        private readonly ISession _session;
        private readonly CassandraDriver _cassandraDriver;

        public CassandraTestDriver(ISession session)
        {
            _session = session;
            _cassandraDriver = new CassandraDriver(_session, "tweekintegrationtests");
            Context = _cassandraDriver;
        }
        
        public IContextDriver Context { get; }
        
        private async Task InsertContextRows(Dictionary<Identity, Dictionary<string, string>> contexts)
        {
            var contextTable = new Table<CassandraDriver.ContextRow>(_session, _cassandraDriver.MappingConfiguration);
            contextTable.CreateIfNotExists();
            var data = contexts.SelectMany(
                identity =>
                    identity.Value.Select(
                        context => new CassandraDriver.ContextRow{identity_id = identity.Key.Id, identity_type = identity.Key.Type, key = context.Key, value = context.Value}));
            await Task.WhenAll(data.Select(async (row)=> await contextTable.Insert(row).ExecuteAsync()));
        }

        

        private async Task DropTable(string tableName)
        {
            await _session.ExecuteAsync(new SimpleStatement(string.Format("DROP TABLE IF EXISTS tweekintegrationtests.{0}", tableName)));
        }

        public TestScope SetTestEnviornment(Dictionary<Identity, Dictionary<string, string>> contexts, string[] keys, Dictionary<string, RuleDefinition> rules)
        {
            return new TestScope(rules:new InMemoryTestDriver(rules), context:Context, init:  () =>  InsertContextRows(contexts), 
                dispose: ()=> Task.WhenAll(DropTable("contexts")));
            ;
        }
    }
}