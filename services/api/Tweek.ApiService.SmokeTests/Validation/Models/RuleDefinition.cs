using System;
using System.Collections.Generic;
using System.Text;

namespace Tweek.ApiService.SmokeTests.Validation.Models
{
    public class RuleDefinition
    {
        public string Format { get; set; }
        public string Payload { get; set; }
        public string[] Dependencies { get; set; }
    }
}
