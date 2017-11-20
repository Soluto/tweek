using FSharpUtils.Newtonsoft;
using System;
using System.Collections.Generic;
using System.Linq;
using Tweek.Engine.DataTypes;

namespace Engine.Tests.Helpers
{
    public static class ContextCreator
    {
        public static Dictionary<Identity, Dictionary<string, JsonValue>> Create(string identityType, string identityId, params Tuple<string,JsonValue>[] contextValues){
            return new Dictionary<Identity, Dictionary<string, JsonValue>>
            {
                {new Identity(identityType, identityId), contextValues.ToDictionary(x=>x.Item1, x=>x.Item2)}
            };
        }

        public static Dictionary<Identity, Dictionary<string, JsonValue>> Merge(
            params Dictionary<Identity, Dictionary<string, JsonValue>>[] contexts)
        {
            return contexts.AsEnumerable().Aggregate((a,b)=>a.Concat(b).ToDictionary(x => x.Key, x => x.Value));
        }
    }
}