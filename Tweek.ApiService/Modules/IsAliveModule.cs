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
using Tweek.ApiService.Interfaces;

namespace Tweek.ApiService.Modules
{
    public class IsAliveModule : NancyModule
    {
        public IsAliveModule(IIsAliveService isAliveService)
        {
            Get["/isalive"] = _ => isAliveService.IsAlive() ? HttpStatusCode.OK : HttpStatusCode.ServiceUnavailable;
        }
    }
}