using System;
using System.Collections.Generic;
using System.Text;
using Engine.DataTypes;

namespace Engine.Context
{
    public static class TweekIdentityProviderExtentions
    {
        public static bool IsIdentityDefinedWithAuth(this TweekIdentityProvider identityProvider, Identity identity)
        {
            var identitiesWithAuth = identityProvider.GetIdentitiesWithAuth();
            return identitiesWithAuth.Contains(identity.Type);
        }
    }
}
