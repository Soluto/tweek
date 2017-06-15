using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Tweek.ApiService.Addons
{
    [AttributeUsage(AttributeTargets.Class)]
    public class TweekContextAddonAttribute: Attribute
    {
        public string Name { get; }

        public TweekContextAddonAttribute(string name)
        {
            Name = name;
        }
    }
}
