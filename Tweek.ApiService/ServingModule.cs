using System.Collections.Generic;
using System.Linq;
using Engine;
using Engine.Core.Context;
using Engine.DataTypes;
using LanguageExt;
using Nancy;
using Newtonsoft.Json;

namespace Tweek.ApiService
{
    public class ServingModule : NancyModule
    {
        private static readonly string PREFIX = "/configurations";

        public ServingModule(ITweek tweek) : base(PREFIX)
        {
            Get["{query*}", runAsync:true] = async (@params, ct) =>
            {
                var isFlatten = @params["$flatten"] == true;
                IReadOnlyDictionary<string,string> requestParams = ((DynamicDictionary) Request.Query).ToDictionary()
                    .ToDictionary(x => x.Key, x => x.Value.ToString());
                var identities = new HashSet<Identity>(requestParams.Where(x => !x.Key.Contains(".")).Select(x=>new Identity(x.Key, x.Value)));
                GetLoadedContextByIdentityType contextProps =
                    identityType => key => requestParams.TryGetValue($"{identityType}.{key}");
                
                var query = ConfigurationPath.New(((string) @params.query));
                var data = await tweek.Calculate(query, identities, contextProps);
                return JsonConvert.SerializeObject(!isFlatten
                        ? TreeResult.From(data)
                        : data.ToDictionary(x => x.Key.ToString(), x => x.Value.ToString()));
            };
            
        }

    }
}