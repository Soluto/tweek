using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace Tweek.ApiService.SmokeTests.GetConfigurations
{
    public class IdentityContextTests
    {
        [Fact(DisplayName = "Get key by identity", Skip = "Not Implemented Yet")]
        public void GetKey_WithIdentityInContext_ReturnsValue()
        {
            
        }

        [Fact(DisplayName = "Get key with rules and identity", Skip = "Not Implemented Yet")]
        public void GetKeyWithRules_WithIdentityInContext_ReturnsMatchValueForIdentityContext()
        {

        }

        [Fact(DisplayName = "Get key with rules, identity, and a field in the context", Skip = "Not Implemented Yet")]
        public void GetKeyWithRules_WithIdentityAndFieldInContext_FieldOverridesIdentityContext()
        {

        }

        [Fact(DisplayName = "Get key with rules and an unknown identity", Skip = "Not Implemented Yet")]
        public void GetKeyWithRules_WithUnkownIdentityInContext_ReturnsValueForNothingMatched()
        {

        }

    }
}
