using System;
using System.Collections.Generic;
using System.Linq;
using Engine;
using Engine.Core.Context;
using Engine.Core.Utils;
using Engine.DataTypes;
using LanguageExt;
using Nancy;
using Newtonsoft.Json;

namespace Tweek.ApiService
{
    public class ServingModule : NancyModule
    {
        public static Tuple<IReadOnlyDictionary<TKey, TValue>, IReadOnlyDictionary<TKey, TValue>> PartitionByKey<TKey, TValue>(IDictionary<TKey,TValue> source, 
            Predicate<TKey> predicate)
        {
            IReadOnlyDictionary<bool, IReadOnlyDictionary<TKey,TValue>> dict = source.GroupBy(x => predicate(x.Key))
                .ToDictionary(p => p.Key, p => (IReadOnlyDictionary<TKey,TValue>)p.ToDictionary(x=>x.Key, x=>x.Value));

            return Tuple.Create(dict.TryGetValue(true).IfNone(new Dictionary<TKey, TValue>()),
                                dict.TryGetValue(false).IfNone(new Dictionary<TKey, TValue>()));
        }

        private static readonly string PREFIX = "/configurations";

        public ServingModule(ITweek tweek) : base(PREFIX)
        {
            Get["{query*}", runAsync:true] = async (@params, ct) =>
            {
                var allParams = PartitionByKey(((DynamicDictionary) Request.Query).ToDictionary(), x => x.StartsWith("$"));
                var modifiers = allParams.Item1;
                var isFlatten = modifiers.TryGetValue("$flatten").Select(x=>bool.Parse(x.ToString())).IfNone(false);

                IReadOnlyDictionary<string, string> contextParams = allParams.Item2.ToDictionary(x=>x.Key, x=>x.Value.ToString());

                var identities = new HashSet<Identity>(contextParams.Where(x => !x.Key.Contains(".")).Select(x=>new Identity(x.Key, x.Value)));
                GetLoadedContextByIdentityType contextProps =
                    identityType => key => contextParams.TryGetValue($"{identityType}.{key}");
                
                var query = ConfigurationPath.New(((string) @params.query));
                var data = await tweek.Calculate(query, identities, contextProps);

                if (query.IsScan)
                    return JsonConvert.SerializeObject(!isFlatten
                        ? TreeResult.From(data)
                        : data.ToDictionary(x => x.Key.ToString(), x => x.Value.ToString()));

                return JsonConvert.SerializeObject(data.Select(x => x.Value.Value).FirstOrDefault());
            };
            
        }

    }
}