using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Cassandra;
using Cassandra.Data.Linq;
using Engine.DataTypes;
using Engine.Drivers.Cassandra;
using Engine.Drivers.Context;
using Engine.Drivers.Keys;
using Engine.Drivers.Rules;
using Engine.Rules.Creation;

namespace Engine.Tests.TestDrivers
{
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
}