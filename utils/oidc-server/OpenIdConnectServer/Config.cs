using System;
using System.Collections.Generic;
using System.Security.Claims;
using IdentityServer4;
using IdentityServer4.Models;
using IdentityServer4.Test;
using Newtonsoft.Json;

namespace OpenIdConnectServer
{
    public static class Config
    {
        public static IEnumerable<ApiResource> GetApiResources() => new List<ApiResource>
            {};

        public static IEnumerable<Client> GetClients() => new List<Client>
            {
                new Client
                {
                    ClientId = Environment.GetEnvironmentVariable("CLIENT_ID"),
                    AllowedGrantTypes = GrantTypes.Implicit,
                    AllowedScopes = new List<string>
                    {
                        IdentityServerConstants.StandardScopes.OpenId,
                        IdentityServerConstants.StandardScopes.Profile,
                        IdentityServerConstants.StandardScopes.Email,
                    },
                    AllowAccessTokensViaBrowser = true,
                    RedirectUris = Environment.GetEnvironmentVariable("REDIRECT_URIS").Split(","),
                    
                }
            };

        public static IEnumerable<IdentityResource> GetIdentityResources() => new List<IdentityResource>
            {
                new IdentityResources.OpenId(),
                new IdentityResources.Profile(),
                new IdentityResources.Email(),
            };

        public static List<TestUser> GetUsers() => new List<TestUser>
            {
                JsonConvert.DeserializeObject<TestUser>(Environment.GetEnvironmentVariable("TEST_USER"))
            };
    }
}