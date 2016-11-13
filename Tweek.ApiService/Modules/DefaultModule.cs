using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Nancy;

namespace Tweek.ApiService.Modules
{
    public class DefaultModule : NancyModule
    {
        public DefaultModule()
        {
            Get["/"] = _ =>
            {
                return HttpStatusCode.OK;
            };
        }
    }
}