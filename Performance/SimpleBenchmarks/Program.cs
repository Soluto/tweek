using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Cassandra;
using Engine;
using Engine.Core.Context;
using Engine.Core.Utils;
using Engine.DataTypes;
using Engine.Drivers.Cassandra;
using Engine.Drivers.Context;
using FSharp.Data;
using static LanguageExt.Prelude;
using Tweek.JPad.Utils;
using Tweek.JPad;

namespace SimpleBenchmarks
{
    class RamContextDriver : IContextReader
    {
        public async Task<Dictionary<string, JsonValue>> GetContext(Identity identity)
        {
            return new Dictionary<string, JsonValue>(new Dictionary<string, JsonValue>()
            {
                ["PartnerBrandId"] = JsonValue.NewString("Verizon"),
                ["DeviceType"] = JsonValue.NewString("Mobile"),
                ["IsInGroup"] = JsonValue.NewString("False"),
                ["DeviceOsVersion"] = JsonValue.NewString("6.0.0"),
                ["DeviceOsType"] = JsonValue.NewString("Android"),
                ["SubscriptionType"] = JsonValue.NewString("InsuranceAndSupport"),
                ["DeviceVendor"] = JsonValue.NewString("google"),
                ["IsTestDevice"] = JsonValue.NewString("false"),
                ["@CreationDate"] = JsonValue.NewString("9/26/2016 9:52:47 PM"),
                ["DeviceModel"] = JsonValue.NewString("marlin"),
                ["AgentVersion"] = JsonValue.NewString("3.282.17")
            });
        }
    }

    static class MathHelpers
    {
        public static double Percentile(this IEnumerable<long> seq, double percentile)
        {
            var elements = seq.ToArray();
            System.Array.Sort(elements);
            double realIndex = percentile * (elements.Length - 1);
            int index = (int)realIndex;
            double frac = realIndex - index;
            if (index + 1 < elements.Length)
                return elements[index] * (1 - frac) + elements[index + 1] * frac;
            else
                return elements[index];
        }

    }


    class Program
    {
        
        static void Main(string[] args)
        {
            var gitDriver = new Tweek.Drivers.Blob.BlobRulesDriver(
                new Uri("https://tweek-management.mysoluto.com/ruleset/latest"),
                new Tweek.Drivers.Blob.WebClient.SystemWebClientFactory());

            ITweek tweek = Task.Run(async () => await Engine.Tweek.Create(
                new RamContextDriver(), gitDriver, JPadRulesParserAdapter.Convert(new JPadParser(new ParserSettings(
                        new Dictionary<string, ComparerDelegate>
                        {
                            ["version"] =  Version.Parse
                        }
                    ))))).Result;
            var query = ConfigurationPath.New("legacy/content/_");

            Console.WriteLine("Start running");
            Stopwatch swOverall = new Stopwatch();
            swOverall.Start();
            var keycount = 0;
            var results = Enumerable.Range(0, 1000)
                .Select(_ =>
                {
                    Stopwatch sw = new Stopwatch();
                    sw.Start();
                    var data = tweek.Calculate(query, new HashSet<Identity>() {new Identity("device", "test")}).Result;
                    System.Threading.Interlocked.Exchange(ref keycount, data.Count);
                    sw.Stop();
                    return sw.ElapsedMilliseconds;
                }).ToList();
            swOverall.Stop();

            Console.WriteLine("total:" + swOverall.ElapsedMilliseconds);
            Console.WriteLine("keys count:" + keycount);
            Console.WriteLine("(95%)" + results.Percentile(0.95));
            Console.WriteLine("avg:" + results.Average());
            Console.WriteLine("max:" + results.Max());
            Console.WriteLine("min:" + results.Min());
            Console.ReadLine();


        }
    }
}
