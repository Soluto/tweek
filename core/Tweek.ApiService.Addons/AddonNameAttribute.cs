using System;

namespace Tweek.ApiService.Addons
{
    [AttributeUsage(AttributeTargets.Class)]
    public class AddonNameAttribute : Attribute
    {
        public string Name;
        public AddonNameAttribute()
        {
        }
    }
}