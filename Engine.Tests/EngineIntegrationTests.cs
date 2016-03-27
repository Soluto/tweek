using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Cassandra;
using Engine.DataTypes;
using Engine.Drivers.Context;
using Engine.Rules.Creation;
using Engine.Tests.Helpers;
using Engine.Tests.TestDrivers;
using Newtonsoft.Json;
using NUnit.Framework;

namespace Engine.Tests
{
    [TestFixture]
    public class EngineIntegrationTests
    {
        private ISession _cassandraSession;
        private ITestDriver driver;
        private Dictionary<Identity,Dictionary<string,string>> contexts;
        private RuleData[] rules;
        private string[] paths;

        private readonly HashSet<Identity> NoIdentities = new HashSet<Identity>();
        private readonly Dictionary<Identity, Dictionary<string, string>> EmptyContexts = new Dictionary<Identity, Dictionary<string, string>>();

        [TestFixtureSetUp]
        public void Setup()
        {
            var cluster = Cluster.Builder()
                .WithQueryOptions(new QueryOptions().SetConsistencyLevel(ConsistencyLevel.One))
                .AddContactPoints("dc0vm1tqwdso6zqj26c.eastus.cloudapp.azure.com",
                    "dc0vm0tqwdso6zqj26c.eastus.cloudapp.azure.com")
                .Build();

            _cassandraSession = cluster.Connect("tweek");
            driver = new CassandraTestDriver(_cassandraSession);
        }

        private async Task Run(Func<ITweek, Task> test)
        {
            var scope = driver.SetTestEnviornment(contexts, paths, rules);
            await scope.Run(test);
        }

        [Test]
        public async Task CalculateSingleValue()
        {
            contexts = EmptyContexts;
            paths = new[] {"abc/somepath"};
            rules = new[] {RuleDataCreator.CreateSingleVariantRule("abc/somepath", matcher: "{}", value: "SomeValue")};

            await Run(async tweek =>
            {
                var val = await tweek.Calculate("_", NoIdentities);
                Assert.AreEqual(val["abc/somepath"].Value, "SomeValue");

                val = await tweek.Calculate("abc/_", NoIdentities);
                Assert.AreEqual(val["somepath"].Value, "SomeValue");

                val = await tweek.Calculate("abc/somepath", NoIdentities);
                Assert.AreEqual(val[""].Value, "SomeValue");
            });
        }

        [Test]
        public async Task CalculateMultipleValues()
        {
            contexts = EmptyContexts;
            paths = new[] { "abc/somepath", "abc/otherpath", "abc/nested/somepath", "def/somepath" };
            rules = paths.Select(x=>RuleDataCreator.CreateSingleVariantRule(x, matcher: "{}", value: "SomeValue")).ToArray();

            await Run(async tweek =>
            {
                var val = await tweek.Calculate("abc/_", NoIdentities);
                Assert.AreEqual(val.Count, 3);
                Assert.AreEqual(val["somepath"].Value, "SomeValue");
                Assert.AreEqual(val["otherpath"].Value, "SomeValue");
                Assert.AreEqual(val["nested/somepath"].Value, "SomeValue");
            });
        }

        [Test]
        public async Task CalculateFilterByMatcher()
        {
            contexts = ContextCreator.Merge(ContextCreator.Create("device", "1"), 
                                            ContextCreator.Create("device", "2", new[] { "SomeDeviceProp", "10" }),
                                            ContextCreator.Create("device", "3", new[] { "SomeDeviceProp", "5" }));

            paths = new[] { "abc/somepath" };
            rules = new[] { RuleDataCreator.CreateSingleVariantRule("abc/somepath", matcher: JsonConvert.SerializeObject(new Dictionary<string,object>()
            {
                {"device.SomeDeviceProp", 5}
            }), value: "SomeValue") };

            await Run(async tweek =>
            {
                var val = await tweek.Calculate("abc/_", new HashSet<Identity> { new Identity("device", "1") });
                Assert.AreEqual(0, val.Count);

                val = await tweek.Calculate("abc/_", new HashSet<Identity> { new Identity("device", "2") });
                Assert.AreEqual(0, val.Count);

                val = await tweek.Calculate("abc/_", new HashSet<Identity> { new Identity("device", "3") });
                Assert.AreEqual(val["somepath"].Value, "SomeValue");
            });
        }

        [Test]
        public async Task CalculateFilterByMatcherWithMultiIdentities()
        {
            contexts = ContextCreator.Merge(
                                               ContextCreator.Create("user", "1", new[] { "SomeUserProp", "10" }),
                                               ContextCreator.Create("device", "1", new[] { "SomeDeviceProp", "5" }));
            paths = new[] { "abc/somepath" };
            rules = new[] { RuleDataCreator.CreateSingleVariantRule("abc/somepath", matcher: JsonConvert.SerializeObject(new Dictionary<string,object>()
            {
                {"user.SomeUserProp", 10},
                {"device.SomeDeviceProp", 5}
            }), value: "SomeValue") };

            await Run(async tweek =>
            {
                var val = await tweek.Calculate("abc/_", new HashSet<Identity> { new Identity("device", "1") });
                Assert.AreEqual(0, val.Count);
                
                val = await tweek.Calculate("abc/_", new HashSet<Identity> { new Identity("user", "1") });
                Assert.AreEqual(0, val.Count);

                val = await tweek.Calculate("abc/_", new HashSet<Identity> { new Identity("device", "1"), new Identity("user", "1") });
                Assert.AreEqual(val["somepath"].Value, "SomeValue");
            });
        }

        [Test]
        public async Task CalculateWithMultiVariant()
        {
            contexts = ContextCreator.Merge(
                                               ContextCreator.Create("user", "1", new[] { "SomeUserProp", "10" }),
                                               ContextCreator.Create("device", "1", new[] { "SomeDeviceProp", "5" }));
            paths = new[] { "abc/somepath" };
            rules = new[] { RuleDataCreator.CreateSingleVariantRule("abc/somepath", matcher: JsonConvert.SerializeObject(new Dictionary<string,object>()
            {
                {"user.SomeUserProp", 10},
                {"device.SomeDeviceProp", 5}
            }), value: "SomeValue") };

            await Run(async tweek =>
            {
                var val = await tweek.Calculate("abc/_", new HashSet<Identity> { new Identity("device", "1") });
                Assert.AreEqual(0, val.Count);

                val = await tweek.Calculate("abc/_", new HashSet<Identity> { new Identity("user", "1") });
                Assert.AreEqual(0, val.Count);

                val = await tweek.Calculate("abc/_", new HashSet<Identity> { new Identity("device", "1"), new Identity("user", "1") });
                Assert.AreEqual(val["somepath"].Value, "SomeValue");
            });
        }
    }
}
