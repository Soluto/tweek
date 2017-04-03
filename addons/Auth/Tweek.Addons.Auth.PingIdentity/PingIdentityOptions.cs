using System;
using System.Security.Cryptography.X509Certificates;
using Microsoft.AspNetCore.Builder;

namespace Tweek.Addons.Auth.PingIdentity
{
     public class PingIdentityOptions : AuthenticationOptions
    {
        public PingIdentityOptions() : base()
        {
            AuthenticationScheme = "Bearer";
            AutomaticAuthenticate = true;
            AutomaticChallenge = true;
        }
        public string Authority { get; set; }
        public string Issuer { get; set; }
        public string Audience { get; set; }
        
        internal Func<string, X509Certificate2> CertificateProvider { get; set; }
        
    }
}