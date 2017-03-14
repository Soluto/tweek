using System;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;
using System.Security.Cryptography.X509Certificates;
using Org.BouncyCastle.OpenSsl;
using Org.BouncyCastle.Security;
using X509Certificate = Org.BouncyCastle.X509.X509Certificate;
using System.Collections.Generic;

namespace Tweek.Addons.Auth.PingIdentity {
  public class CertificateProvider {

      private  static Func<string, Task<System.Security.Cryptography.X509Certificates.X509Certificate2>> Memoize(Func<string, Task<System.Security.Cryptography.X509Certificates.X509Certificate2>> fn){
          var cache = new Dictionary<string, X509Certificate2>();
          return async (thumb)=> {
              if (!cache.ContainsKey(thumb)){
                   cache[thumb] = await fn(thumb);
              }
              return cache[thumb];
          };
      }

      public static Func<string, Task<System.Security.Cryptography.X509Certificates.X509Certificate2>> CreateFetcher(string baseUrl){
          return Memoize(async (certificateThumbprint)=>{
              var requestUri = baseUrl + "/ext/oauth/x509/x5t?v=" + certificateThumbprint;
              var data = await new HttpClient().GetAsync(requestUri);
              data.EnsureSuccessStatusCode();
              var pemString = await data.Content.ReadAsStringAsync();
              var cert = (X509Certificate)new PemReader(new StringReader(pemString)).ReadObject();
              return new System.Security.Cryptography.X509Certificates.X509Certificate2(cert.GetEncoded());
          });
      }

  }
}
