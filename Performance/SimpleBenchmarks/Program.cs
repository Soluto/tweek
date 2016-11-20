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
using Engine.Drivers.Rules.Git;
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
                ["DeviceOsVersion"] = "NMR1",
                ["DeviceOsType"] = "5.0.0.0",
                ["SubscriptionType"] = "InsuranceAndSupport",
                ["DeviceVendor"] = "google",
                ["IsTestDevice"] = "false",
                ["@CreationDate"] = "9/26/2016 9:52:47 PM",
                ["DeviceModel"] = "marlin",
                ["AgentVersion"] = "3.282.17"
            });
        }
    }
    class Program
    {
        static void Main(string[] args)
        {
            var gitDriver = new GitDriver(
                Path.Combine(Environment.CurrentDirectory, "tweek-rules" + Guid.NewGuid()),
                new RemoteRepoSettings()
                {
                    url = "http://tweek-gogs.c8940f48.svc.dockerapp.io/tweek/tweek.git",
                    Email = "tweek@soluto.com",
                    UserName = "tweek",
                    Password = "***REMOVED***"
                });

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
            Console.WriteLine(Enumerable.Range(0, 1000)
                .Select(_ =>
                {
                    Stopwatch sw = new Stopwatch();
                    sw.Start();
                    var data = tweek.Calculate(query, new HashSet<Identity>() { }, ext_context).Result;
                    sw.Stop();
                    return sw.ElapsedMilliseconds;
                }).Average());
            Console.ReadLine();


        }
    }
}
