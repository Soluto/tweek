using System;
using System.Collections.Generic;
using System.Linq;
using System.Reactive;
using System.Threading.Tasks;
using Cassandra;
using Cassandra.Data.Linq;
using Cassandra.Mapping;
using Engine.DataTypes;
using Engine.Drivers.Context;
using LanguageExt;
using Unit = LanguageExt.Unit;

namespace Engine.Drivers.Cassandra
{
    public class CassandraDriver : IContextDriver
    {
        private readonly string _keyspace;

        public CassandraDriver(ISession session, string keyspace = "tweek")
        {
            _session = session;
            _keyspace = keyspace;
            MappingConfiguration = new MappingConfiguration() {}.Define(
                new Map<ContextRow>()
                    .KeyspaceName(_keyspace)
                    .TableName("contexts")
                    .PartitionKey(x => x.identity_type, x => x.identity_id)
                    .ClusteringKey(x => x.key));
        }

        public class ContextRow
        {
            public string identity_type { get; set; }
            public string identity_id { get; set; }
            public string key { get; set; }
            public string value { get; set; }
        } 

        private readonly ISession _session;

        public MappingConfiguration MappingConfiguration { get; }


        public async Task<Dictionary<string, string>> GetContext(Identity identity)
        {
            var contextTable = new Table<ContextRow>(_session, MappingConfiguration);
            var queryResult = await contextTable.Where(x=>x.identity_id == identity.Id && x.identity_type == identity.Type).ExecuteAsync();
            return queryResult.ToDictionary(x => x.key, x => x.value);
        }

        public async Task AppendContext(Identity identity, Dictionary<string, string> context)
        {
            var contextTable = new Table<ContextRow>(_session, MappingConfiguration);
            var creationDateInsert = contextTable
                .Insert(
                    new ContextRow()
                    {
                        identity_type = identity.Type,
                        identity_id = identity.Id,
                        key = "@CreationDate",
                        value = DateTimeOffset.UtcNow.ToString(),
                    })
                .IfNotExists()
                .ExecuteAsync();

            await Task.WhenAll(creationDateInsert,
                Task.WhenAll(context.Select(prop =>
                    contextTable
                        .Where(
                            x => x.identity_id == identity.Id && x.identity_type == identity.Type && x.key == prop.Key)
                        .Select(
                            u =>
                                new ContextRow()
                                {
                                    value = prop.Value,
                                })
                        .Update()
                        .ExecuteAsync()
                )
            ));
        }

        public event Action OnPathChanges = () => { };
        
    }
}
