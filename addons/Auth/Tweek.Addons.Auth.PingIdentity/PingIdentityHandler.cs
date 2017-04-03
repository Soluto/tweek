using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;

namespace Tweek.Addons.Auth.PingIdentity
{
    public class PingIdentityHandler : AuthenticationHandler<PingIdentityOptions>
    {
        private Func<string, Task<X509Certificate2>> certificateProvider;
        private readonly ILogger logger;

        public PingIdentityHandler(Func<string, Task<X509Certificate2>>certificateProvider, ILogger Logger)
        {
            this.certificateProvider = certificateProvider;
            this.logger = Logger;
        }

        protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
        {
             try
            {
                var authorizationHeader = Request.Headers["Authorization"].ToString();
                if (string.IsNullOrEmpty(authorizationHeader))
                {
                    return AuthenticateResult.Skip();
                }

                if (!authorizationHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                {
                    return AuthenticateResult.Skip();
                }

                var jwtString = authorizationHeader.Substring("Bearer ".Length).Trim();
                if (string.IsNullOrEmpty(jwtString))
                {
                    return AuthenticateResult.Skip();
                }

                var jwtSecurityTokenHandler = new JwtSecurityTokenHandler();

                var jwtSecurityToken = (JwtSecurityToken)jwtSecurityTokenHandler.ReadToken(jwtString);
                if (jwtSecurityToken.Issuer != Options.Issuer) return AuthenticateResult.Skip(); 
                
                var pingIdentityCertificate = await certificateProvider(jwtSecurityToken.Header["x5t"].ToString());

                var claims = jwtSecurityTokenHandler.ValidateToken(jwtString, new TokenValidationParameters
                {
                    IssuerSigningKeyResolver = (token, securityToken, keyIdentifier, parameters) => new []{new X509SecurityKey(pingIdentityCertificate)},
                    ValidIssuer = Options.Issuer,
                    ValidateAudience = false
                }, out var validatedToken);

                return AuthenticateResult.Success(new AuthenticationTicket( claims, new AuthenticationProperties(), "Bearer"));
            }
            catch (Exception ex)
            {
                return AuthenticateResult.Fail(ex);
            }
        }
    }
}