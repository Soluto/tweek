using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Cassandra;
using Cassandra.Data.Linq;
using Cassandra.Mapping;
using Engine.DataTypes;
using Engine.Drivers.Context;
using Engine.Drivers.Keys;
using Engine.Drivers.Rules;
using Engine.Rules.Creation;

namespace Engine.Drivers.Cassandra
{
    public class CassandraDriver : IContextDriver, IKeysDriver, IRulesDriver
    {
        public class PathRow
        {
            public string path { get; set; }
        }

        public class ContextRow
        {
            public string identity_type { get; set; }
            public string identity_id { get; set; }
            public string key { get; set; }
            public string value { get; set; }
        }

        private readonly ISession _session;

        public static readonly MappingConfiguration MappingConfiguration = MappingConfiguration.Global.Define(
            new Map<PathRow>()
                .KeyspaceName("tweek")
                .TableName("paths")
                .PartitionKey(x => x.path),
            new Map<ContextRow>()
                .KeyspaceName("tweek")
                .TableName("contexts")
                .PartitionKey(x => x.identity_type, x => x.identity_id)
                .ClusteringKey(x => x.key),
            new Map<RuleData>()
                .KeyspaceName("tweek")
                .TableName("rules")
                .PartitionKey(x => x.Key)
                .ClusteringKey(x => x.Order)
                .Column(x => x.Id, cm => cm.WithName("id"))
                .Column(x => x.Key, cm => cm.WithName("key"))
                .Column(x => x.Order, cm => cm.WithName("rule_order"))
                .Column(x => x.MatcherSchema, cm => cm.WithName("matcher_schema"))
                .Column(x => x.MultiVariant_ValueDistributionSchema, cm => cm.WithName("multi_variant_value_distribution_schema"))
                .Column(x => x.SingleVariant_Value, cm => cm.WithName("single_variant_value"))
                .Column(x => x.MultiVariant_OwnerType, cm => cm.WithName("multi_variant_owner_type")));

        public CassandraDriver(ISession session)
        {
            _session = session;
        }

        public async Task<Dictionary<string, string>> GetContext(Identity identity)
        {
            var contextTable = new Table<ContextRow>(_session, MappingConfiguration);
            var queryResult = await contextTable.Where(x=>x.identity_id == identity.Id && x.identity_type == identity.Type).ExecuteAsync();
            return queryResult.ToDictionary(x => x.key, x => x.value);
        }

        public event Action OnPathChanges = () => { };

        public async Task<List<string>> GetPaths()
        {
            var contextTable = new Table<PathRow>(_session, MappingConfiguration);
            return (await contextTable.Select(x=>x.path).ExecuteAsync()).ToList();
        }

        public event Action OnRulesChange = () => { };

        public async Task<List<RuleData>> GetRules()
        {
            var ruleData = new Table<RuleData>(_session, MappingConfiguration);
            return (await ruleData.ExecuteAsync()).ToList();
        }
    }
}
