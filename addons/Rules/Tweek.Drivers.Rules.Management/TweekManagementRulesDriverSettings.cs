using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Reactive.Concurrency;
using System.Reactive.Disposables;
using System.Reactive.Linq;
using System.Reactive.Subjects;
using System.Text;
using System.Threading.Tasks;
using App.Metrics;
using App.Metrics.Core.Abstractions;
using App.Metrics.Core.Options;
using Engine.Drivers.Rules;
using LanguageExt;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Newtonsoft.Json;
using static LanguageExt.Prelude;
using Unit = App.Metrics.Unit;

namespace Tweek.Drivers.Rules.Management
{

    public class TweekManagementRulesDriverSettings
    {
       public int SampleIntervalInMs {get;set;} = 30000;
       public int FailureDelayInMs {get;set;} = 60000;

       public TimeSpan FailureDelay => TimeSpan.FromMilliseconds(FailureDelayInMs);
       public TimeSpan SampleInterval => TimeSpan.FromMilliseconds(SampleIntervalInMs);
    }
}
