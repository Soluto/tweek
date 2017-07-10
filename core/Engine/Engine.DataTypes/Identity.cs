using System;

namespace Engine.DataTypes
{
    public class Identity: Tuple<string, string>
    {
        public string Type => Item1;
        public string Id => Item2;

        public Identity(string type, string id)
            : base(type.ToLower(), id.ToLower())
        {
        }

        public const string GlobalIdentityType = "@global";
        public static readonly Identity GlobalIdentity = new Identity(GlobalIdentityType, "");
    }
}