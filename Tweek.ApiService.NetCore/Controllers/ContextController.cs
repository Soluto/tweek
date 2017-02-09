using Engine.DataTypes;
using Engine.Drivers.Context;
using FSharpUtils.Newtonsoft;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Tweek.ApiService.NetCore.Controllers
{
    [Route("context")]
    public class ContextController : Controller
    {
        private readonly IContextDriver _contextDriver;
        private readonly JsonSerializer _serializer;

        public ContextController(IContextDriver contextDriver, JsonSerializer serializer)
        {
            _contextDriver = contextDriver;
            _serializer = serializer;
        }

        [HttpPost("{identityType}/{*identityId}")]
        public async Task AppendContext([FromRoute] string identityType, [FromRoute] string identityId)
        {
            Dictionary<string, JsonValue> data;
            using (var txtReader = new StreamReader(HttpContext.Request.Body))
            using (var jsonReader = new JsonTextReader(txtReader)) {
                data = _serializer.Deserialize<Dictionary<string,JsonValue>>(jsonReader);
            }
            var identity = new Identity(identityType, identityId);
            await _contextDriver.AppendContext(identity, data);
        }

        [HttpDelete("{identityType}/{identityId}/{*prop}")]
        public async Task DeleteFromContext([FromRoute] string identityType, [FromRoute] string identityId, [FromRoute] string prop)
        {
            var identity = new Identity(identityType, identityId);
            await _contextDriver.RemoveFromContext(identity, prop);
        }

    }
}
