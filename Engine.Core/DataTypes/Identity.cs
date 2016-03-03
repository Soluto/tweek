using System;

namespace Engine.Core.DataTypes
{
    public class Identity: Tuple<string, string>
    {
        public string Type {get { return Item1; }}
        public string Id {get { return Item2; }}

        public Identity(string type, string id)
            : base(type, id)
        {
        }
    }
}