using System;
using System.Collections.Generic;
using Tweek.Engine.DataTypes;

namespace Tweek.Engine
{
    public class TweekValuesResult
    {
        public Dictionary<ConfigurationPath, ConfigurationValue> Data { get; } = new Dictionary<ConfigurationPath, ConfigurationValue>();
        public Dictionary<ConfigurationPath, Exception> Errors { get; } = new Dictionary<ConfigurationPath, Exception>();
    }
}