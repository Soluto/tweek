using FSharpUtils.Newtonsoft;
using System.Threading.Tasks;
using Tweek.Engine.DataTypes;
using Tweek.Engine.Drivers.Context;
using System.Collections.Concurrent;
using System.Net.Http;
using Newtonsoft.Json;
using Tweek.Utils;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Text;
using System;

namespace Tweek.ApiService.SA
{
    public class RemoteTweekContextDriver : IContextDriver
    {
        private HttpClient _client;
        private JsonSerializer _serializer;
        private ConcurrentDictionary<string, Dictionary<string, JsonValue>> _data;
        
        public RemoteTweekContextDriver(Func<HttpClient> clientFactory)
        {

            _data = new ConcurrentDictionary<string, Dictionary<string,JsonValue>>();
            _client = clientFactory();
            _serializer = new JsonSerializer(){
                Converters = {
                    new JsonValueConverter()
                }
            };
        }

        public async Task<Dictionary<string, JsonValue>> GetContext(Identity identity)
        {
            var value = await _client.GetAsync($"/api/v2/context/{identity.Type}/{identity.Id}");
            value.EnsureSuccessStatusCode();
            var data = await value.Content.ReadAsStringAsync();
            using (var reader = new StringReader(data))
            using (var jsonReader = new JsonTextReader(reader)){
                return _serializer.Deserialize<Dictionary<string,JsonValue>>(jsonReader);
            }
        }

        public async Task AppendContext(Identity identity, Dictionary<string, JsonValue> context)
        {
            var sw = new StringWriter();
            _serializer.Serialize(sw, context);

            var result = await _client.PostAsync($"/api/v2/context/{identity.Type}/{identity.Id}", 
                                                new StringContent(sw.ToString(), Encoding.UTF8, "application/json"));
            result.EnsureSuccessStatusCode();
        }

        public async Task RemoveFromContext(Identity identity, string key)
        {
            var result = await _client.DeleteAsync($"/api/v2/context/{identity.Type}/{identity.Id}/{key}");
            result.EnsureSuccessStatusCode();
        }

        public async Task DeleteContext(Identity identity)
        {
            var result = await _client.DeleteAsync($"/api/v2/context/{identity.Type}/{identity.Id}");
            result.EnsureSuccessStatusCode();
        }

    }
}
