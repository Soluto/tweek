using System;
using System.Collections.Generic;
using System.Linq;
using Engine;
using Engine.Core.Context;
using Engine.Core.Utils;
using Engine.DataTypes;
using LanguageExt;
using Nancy;
using Newtonsoft.Json;

namespace Tweek.ApiService
{
    public class MonitoringModule : NancyModule
    {
        private static readonly string PREFIX = "/monitor";

        public MonitoringModule(ITweek tweek) : base(PREFIX)
        {
            Get["{query*}", runAsync: true] = async (@params, ct) =>
             {
                 return "pita";
             };
        }
    }
}