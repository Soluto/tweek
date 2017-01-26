using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using Tweek.Drivers.Blob;

namespace Tweek.Drivers.Blob.WebClient
{
    public class SystemWebClientFactory : IWebClientFactory
    {
        public IWebClient Create()
        {
            return new SystemWebClient();
        }
    }
}