namespace Engine.DataTypes
{
    public struct ConfigurationValue
    {
        public string Value;

        public ConfigurationValue(string value)
        {
            Value = value;
        }

        public static ConfigurationValue New(string value)
        {
            return new ConfigurationValue(value);
        }

        public override string ToString()
        {
            return Value;
        }
    }
}