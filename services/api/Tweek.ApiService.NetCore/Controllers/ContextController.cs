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
using Tweek.ApiService.NetCore.Security;

namespace Tweek.ApiService.NetCore.Controllers
{
    [Route("api/v1/context")]
    public class ContextController : Controller
    {
        private readonly IContextDriver _contextDriver;
        private readonly JsonSerializer _serializer;
        private readonly CheckWriteContextAccess _checkAccess;

        public ContextController(IContextDriver contextDriver, JsonSerializer serializer, CheckWriteContextAccess checkAccess)
        {
            _contextDriver = contextDriver;
            _serializer = serializer;
            _checkAccess =checkAccess;
        }

        [HttpPost("{identityType}/{*identityId}")]
        public async Task<ActionResult> AppendContext([FromRoute] string identityType, [FromRoute] string identityId)
        {
            if (!_checkAccess(User, new Identity(identityType, identityId))) return Forbid();

            Dictionary<string, JsonValue> data;
            using (var txtReader = new StreamReader(HttpContext.Request.Body))
            using (var jsonReader = new JsonTextReader(txtReader)) {
                data = _serializer.Deserialize<Dictionary<string,JsonValue>>(jsonReader);
            }

            var identity = new Identity(identityType, identityId);
            await _contextDriver.AppendContext(identity, data);
            return Ok();
        }

        [HttpDelete("{identityType}/{identityId}/{*prop}")]
        public async Task<ActionResult> DeleteFromContext([FromRoute] string identityType, [FromRoute] string identityId, [FromRoute] string prop)
        {
            if (!_checkAccess(User, new Identity(identityType, identityId))) return Forbid();
            var identity = new Identity(identityType, identityId);
            await _contextDriver.RemoveFromContext(identity, prop);
            return Ok();
        }

    }
}
