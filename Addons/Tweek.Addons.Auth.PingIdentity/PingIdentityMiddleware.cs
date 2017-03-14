using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Net.Http;
using System.Security.Cryptography.X509Certificates;
using System.Text.Encodings.Web;
using System.Threading.Tasks;

namespace Tweek.Addons.Auth.PingIdentity
{
    public class PingIdentityMiddleware : AuthenticationMiddleware<PingIdentityOptions>
    {
        private readonly ILogger logger;
        private readonly Func<string, Task<X509Certificate2>> certificateFetcher;

        public PingIdentityMiddleware(RequestDelegate  next, ILoggerFactory loggerFactory,
            UrlEncoder encoder, IOptions<PingIdentityOptions> options)
            : base(next, options, loggerFactory, encoder)
        {
            logger = loggerFactory.CreateLogger("PingIdentity");
            certificateFetcher = CertificateProvider.CreateFetcher(this.Options.Authority);
        }

        protected override AuthenticationHandler<PingIdentityOptions> CreateHandler()
        {
            return new PingIdentityHandler(certificateFetcher, logger);
        }
    }
}