using System;
using System.Collections.Generic;
using System.Text;

namespace Tweek.Drivers.Rules.Management
{
    public class ManagementSettings
    {
        public int SampleIntervalInMs { get; set; } = 30000;
        public TimeSpan SampleInterval => TimeSpan.FromMilliseconds(SampleIntervalInMs);
    }
}
