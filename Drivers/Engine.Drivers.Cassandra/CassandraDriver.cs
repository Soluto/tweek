using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Cassandra;
using Cassandra.Data.Linq;
using Cassandra.Mapping;
using Engine.DataTypes;
using Engine.Drivers.Context;

namespace Engine.Drivers.Cassandra
{
    public class CassandraDriver : IContextDriver
    {
    
        public class ContextRow
        {
            public string identity_type { get; set; }
            public string identity_id { get; set; }
            public string key { get; set; }
            public string value { get; set; }
        }

        private readonly ISession _session;

        public static readonly MappingConfiguration MappingConfiguration = MappingConfiguration.Global.Define(
            
            new Map<ContextRow>()
                .KeyspaceName("tweek")
                .TableName("contexts")
                .PartitionKey(x => x.identity_type, x => x.identity_id)
                .ClusteringKey(x => x.key)
            );

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
        
    }
}
