using System;
using System.Collections.Generic;
using System.Text;

namespace Tweek.ApiService.Addons
{
    public class AuthenticationProviderAttribute : Attribute
    {
        public string Name { get; set; }
    }
}
