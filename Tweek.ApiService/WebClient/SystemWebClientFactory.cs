using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web;
using Tweek.Drivers.Blob;

namespace Tweek.ApiService.WebClient
{
    public class SystemWebClientFactory : IWebClientFactory
    {
        public IWebClient Create()
        {
            return new SystemWebClient();
        }
    }
}