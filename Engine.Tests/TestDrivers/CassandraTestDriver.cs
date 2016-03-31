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
using Engine.Drivers.Rules.Git;
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
            Context = cassandraDriver;
        }
        
        public IContextDriver Context { get; }
        
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


        private async Task InsertRuleData(GitDriver driver, Dictionary<string, RuleDefinition> rules)
        {
            await
                Task.WhenAll(
                    rules.Select(
                        x => driver.CommitRuleset(x.Key, x.Value, "tweek-integration-tests", "tweek@soluto.com", DateTimeOffset.UtcNow)));
        }

        private async Task DropTable(string tableName)
        {
            await _session.ExecuteAsync(new SimpleStatement(string.Format("DROP TABLE IF EXISTS tweek.{0}", tableName)));
        }

        public TestScope SetTestEnviornment(Dictionary<Identity, Dictionary<string, string>> contexts, string[] keys, Dictionary<string, RuleDefinition> rules)
        {
            var gitDriver = new GitDriver(Path.Combine(Environment.CurrentDirectory, "tweek-rules-tests" + Guid.NewGuid()));
            return new TestScope(rules:gitDriver, context:Context, init:  () =>  Task.WhenAll(InsertContextRows(contexts), InsertRuleData(gitDriver, rules)), 
                dispose: ()=> Task.WhenAll(DropTable("contexts"),DropTable("paths"), DropTable("rules")));
            ;
        }
    }
}