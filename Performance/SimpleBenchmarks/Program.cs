using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Cassandra;
using Engine;
using Engine.Core.Context;
using Engine.DataTypes;
using Engine.Drivers.Cassandra;
using Engine.Drivers.Context;
using static LanguageExt.Prelude;
using Tweek.JPad.Utils;
using Tweek.JPad;

namespace SimpleBenchmarks
{
    class RamContextDriver : IContextReader
    {
        public async Task<Dictionary<string, string>> GetContext(Identity identity)
        {
            return new Dictionary<string, string>(new Dictionary<string, string>()
            {
                ["PartnerBrandId"] = "Verizon",
                ["DeviceType"] = "Mobile",
                ["IsInGroup"] = "False",
                ["DeviceOsVersion"] = "5.0.0.0",
                ["DeviceOsType"] = "Android",
                ["SubscriptionType"] = "InsuranceAndSupport",
                ["DeviceVendor"] = "google",
                ["IsTestDevice"] = "false",
                ["@CreationDate"] = "9/26/2016 9:52:47 PM",
                ["DeviceModel"] = "marlin",
                ["AgentVersion"] = "3.282.17"
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
                            ["version"] = Version.Parse
                        }
                    ))))).Result;
            var query = ConfigurationPath.New("_");

            GetLoadedContextByIdentityType ext_context =
                (identityType) =>
                    (key) => (identityType == "device" && key == "@CreationDate") ? Some("06/06/16") : None;

            Console.WriteLine("Start running");
            Stopwatch swOverall = new Stopwatch();
            swOverall.Start();
            var keycount = 0;
            var results = Task.WhenAll(Enumerable.Range(0, 1000)
                .Select(async _ =>
                {
                    Stopwatch sw = new Stopwatch();
                    sw.Start();
                    var data = await tweek.Calculate(query, new HashSet<Identity>() { }, ext_context).ConfigureAwait(false);
                    System.Threading.Interlocked.Increment(ref keycount);
                    sw.Stop();
                    return sw.ElapsedMilliseconds;
                })).Result;
            swOverall.Stop();
            Console.WriteLine("total:" + swOverall.ElapsedMilliseconds);
            Console.WriteLine("keys count:" + keycount / 1000);
            Console.WriteLine("(95%)" + results.Percentile(0.95));
            Console.WriteLine("avg:" + results.Average());
            Console.WriteLine("max:" + results.Max());
            Console.WriteLine("min:" + results.Min());

            Console.ReadLine();


        }
    }
}
