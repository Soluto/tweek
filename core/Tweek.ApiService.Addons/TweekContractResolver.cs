using System;
using System.Reflection;
using FSharpUtils.Newtonsoft;
using Newtonsoft.Json.Serialization;
using Tweek.Utils;

namespace Tweek.ApiService.Addons
{
    public class TweekContractResolver : DefaultContractResolver
    {
        protected override JsonContract CreateContract(Type objectType)
        {
            var contract = base.CreateContract(objectType);

            if (typeof(JsonValue).GetTypeInfo().IsAssignableFrom(objectType.GetTypeInfo()))
            {
                contract.Converter = new JsonValueConverter();
            }

            return contract;
        }
    }
}
