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
using Engine.Drivers.Rules.Git;
using static LanguageExt.Prelude;
using Tweek.JPad.Utils;
using Tweek.JPad;

namespace SimpleBenchmarks
{
    class Program
    {
        static void Main(string[] args)
        {

            var cluster = Cluster.Builder()
                .WithQueryOptions(new QueryOptions().SetConsistencyLevel(ConsistencyLevel.All))
                .AddContactPoints("dc0vm1tqwdso6zqj26c.eastus.cloudapp.azure.com",
                    "dc0vm0tqwdso6zqj26c.eastus.cloudapp.azure.com")
                .Build();

            var session = cluster.Connect("tweek");

            var contextDriver = new CassandraDriver(session);

            var gitDriver = new GitDriver(
                Path.Combine(Environment.CurrentDirectory, "tweek-rules" + Guid.NewGuid()),
                new RemoteRepoSettings()
                {
                    url = "http://gogs-80b6a277.29d5ffeb.svc.dockerapp.io/tweek/tweek-rules",
                    Email = "tweek@soluto.com",
                    UserName = "tweek",
                    Password = "***REMOVED***"
                });

            ITweek tweek = Task.Run(async () => await Engine.Tweek.Create(
                contextDriver, gitDriver, JPadRulesParserAdapter.Convert(new JPadParser(new ParserSettings(
                        new Dictionary<string, ComparerDelegate>
                        {
                            ["version"] =Version.Parse
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
                    var data = tweek.Calculate(query, new HashSet<Identity>() {}, ext_context).Result;
                    sw.Stop();
                    return sw.ElapsedMilliseconds;
                }).Average());
            Console.ReadLine();

        }
    }
}
