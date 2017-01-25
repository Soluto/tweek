using FSharpUtils.Newtonsoft;

namespace Engine.DataTypes
{
    public struct ConfigurationValue
    {
        public readonly JsonValue Value;

        public ConfigurationValue(JsonValue value)
        {
            Value = value;
        }

        public static ConfigurationValue New(JsonValue value)
        {
            return new ConfigurationValue(value);
        }

        public override string ToString()
        {
            return Value.ToString();
        }
    }
}