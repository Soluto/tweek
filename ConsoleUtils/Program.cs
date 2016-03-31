using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Cassandra;
using Engine.DataTypes;
using Engine.Tests.Helpers;
using Engine.Tests.TestDrivers;
using Newtonsoft.Json;

namespace ConsoleUtils
{
    class Program
    {
        static void Main(string[] args)
        {
            /*
            var cluster = Cluster.Builder()
               .WithQueryOptions(new QueryOptions().SetConsistencyLevel(ConsistencyLevel.All))
               .AddContactPoints("dc0vm1tqwdso6zqj26c.eastus.cloudapp.azure.com",
                   "dc0vm0tqwdso6zqj26c.eastus.cloudapp.azure.com")
               .Build();

            var session = cluster.Connect("tweek");
            var driver = new CassandraTestDriver(session);

            var contexts = ContextCreator.Merge(
                       ContextCreator.Create("device", "1", new[] { "@CreationDate", "05/05/05" }),
                       ContextCreator.Create("device", "2", new[] { "@CreationDate", "07/07/07" }),
                       ContextCreator.Create("device", "3", new[] { "@CreationDate", "09/09/09" }),
                       ContextCreator.Create("user", "4", new[] { "@CreationDate", "09/09/09" }));

            var paths = new[] { "abc/somepath" };
            var rules = new[] { JPad.CreateMultiVariantRule("abc/somepath", matcher: "{}",
                valueDistrubtions: new Dictionary<DateTimeOffset, string>
                {{DateTimeOffset.Parse("06/06/06"),JsonConvert.SerializeObject(new
            {
                type = "bernoulliTrial",
                args= 1
            })
            },
            {DateTimeOffset.Parse("08/08/08"), JsonConvert.SerializeObject(new
            {
                type = "bernoulliTrial",
                args= 0
            })
            }},
            ownerType:"device"), RuleDataCreator.CreateSingleVariantRule("abc/somepath", matcher:"{}", value: "Other")};

            
            var scope = driver.SetTestEnviornment(contexts, paths, rules);
            scope.Run(async (tweek) =>
            {
                Console.WriteLine("env is set");
                Console.ReadLine();
            }).Wait();
            */
        }
    }
}
