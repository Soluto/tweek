using Engine.DataTypes;
using Engine.Drivers.Context;
using FSharp.Data;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Tweek.ApiService.NetCore.Controllers
{
    [Route("context")]
    public class ContextController : Controller
    {
        private readonly IContextDriver _contextDriver;

        public ContextController(IContextDriver contextDriver)
        {
            _contextDriver = contextDriver;
        }

        [HttpPost("{identityType}/{*identityId}")]
        public async Task AppendContext([FromRoute] string identityType, [FromRoute] string identityId, [FromBody] Dictionary<string, JsonValue> data)
        {
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
