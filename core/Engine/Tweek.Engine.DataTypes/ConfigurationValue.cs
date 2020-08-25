using System;
using FSharpUtils.Newtonsoft;

namespace Tweek.Engine.DataTypes
{
    public struct ConfigurationValue
    {
        public readonly JsonValue Value;
        public readonly Exception Exception;

        public ConfigurationValue(JsonValue value)
        {
            Value = value;
            Exception = null;
        }

        public ConfigurationValue(Exception exception)
        {
            Value = JsonValue.Null;
            Exception = exception;
        }

        public static ConfigurationValue New(JsonValue value)
        {
            return new ConfigurationValue(value);
        }

        public static ConfigurationValue Error(Exception exception)
        {
            return new ConfigurationValue(exception);
        }

        public override string ToString()
        {
            return Value.ToString();
        }
    }
}