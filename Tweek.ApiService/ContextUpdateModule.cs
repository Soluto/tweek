using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using Engine.DataTypes;
using Engine.Drivers.Context;
using Nancy;
using Nancy.ModelBinding;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Tweek.ApiService
{
    public class ContextUpdateModule : NancyModule
    {
        private static readonly string PREFIX = "/context";

        public ContextUpdateModule(IContextDriver driver) : base(PREFIX)
        {
            Get["/{identityType}/{identityId*}", runAsync: true] = async (@params, ct) =>
            {
                string identityType = @params.identityType;
                string identityId = @params.identityId;
                var identity = new Identity(identityType, identityId);

                var identityContext = await driver.GetContext(identity);
                return identityContext;
            };

            Post["/{identityType}/{identityId*}", runAsync: true] = async (@params, ct) =>
            {
                string identityType = @params.identityType;
                string identityId = @params.identityId;
                var identity = new Identity(identityType, identityId);
                Dictionary<string,string> data;
                using (var reader = new StreamReader(Request.Body))
                {
                    data = JsonConvert.DeserializeObject<JObject>(await reader.ReadToEndAsync())
                        .Properties()
                        .ToDictionary(x => x.Name, x => x.Value.ToObject<object>()
                            .ToString());
                }
                
                await driver.AppendContext(identity, data);
                
                return 200;
            };

            Delete["/{identityType}/{identityId}/{key*}", runAsync: true] = async (@params, ct) =>
            {
                string identityType = @params.identityType;
                string identityId = @params.identityId;
                string key = @params.key;
                var identity = new Identity(identityType, identityId);
                await driver.RemoveFromContext(identity, key);
                return 200;
            };
        }
    }
}