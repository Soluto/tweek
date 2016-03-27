using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Cassandra;
using Engine.Core;
using Engine.Core.Rules;
using Engine.DataTypes;
using Engine.Rules;
using Engine.Tests;
using Engine.Tests.Helpers;
using Engine.Tests.TestDrivers;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Newtonsoft.Json;
using NUnit.Framework;
using Assert = Microsoft.VisualStudio.TestTools.UnitTesting.Assert;

namespace Engine.Tests
{
    [TestFixture]
    public class EngineIntegrationTests
    {
        private ISession _cassandraSession;

        [TestFixtureSetUp]
        public void Setup()
        {
            var cluster = Cluster.Builder()
                .WithQueryOptions(new QueryOptions().SetConsistencyLevel(ConsistencyLevel.One))
                .AddContactPoints("dc0vm1tqwdso6zqj26c.eastus.cloudapp.azure.com",
                    "dc0vm0tqwdso6zqj26c.eastus.cloudapp.azure.com")
                .Build();

            _cassandraSession = cluster.Connect("tweek");
        }

        public ITestDriver GetTestDriver()
        {
            return new CassandraTestDriver(_cassandraSession);
        }

        [Test]
        public async Task CalculateSingleValue()
        {
            var driver = GetTestDriver();
            var context =  ContextCreator.Create("device", "1");
            var paths = new[] {"abc/somepath"};
            var rules = new[]{RuleDataCreator.CreateSingleVariantRule("abc/somepath", matcher: "{}", value: "SomeValue")};
            var scope = driver.SetTestEnviornment(context, paths, rules);
            await scope.Run(async tweek =>
            {
                var val = await tweek.Calculate("abc/_", new HashSet<Identity> { new Identity("device", "1") });
                Assert.AreEqual(val["somepath"].Value, "SomeValue");
                val = await tweek.Calculate("abc/somepath", new HashSet<Identity> { new Identity("device", "1") });
                Assert.AreEqual(val[""].Value, "SomeValue");
            });
        }

        [Test]
        public async Task CalculateMultipleValues()
        {
            var driver = GetTestDriver();
            var context = ContextCreator.Create("device", "1");
            var paths = new[] { "abc/somepath", "abc/otherpath", "abc/nested/somepath", "def/somepath" };
            var rules = paths.Select(x=>RuleDataCreator.CreateSingleVariantRule(x, matcher: "{}", value: "SomeValue")).ToArray();
            var scope = driver.SetTestEnviornment(context, paths, rules);
            await scope.Run(async tweek =>
            {
                var val = await tweek.Calculate("abc/_", new HashSet<Identity> { new Identity("device", "1") });
                Assert.AreEqual(val.Count, 3);
                Assert.AreEqual(val["somepath"].Value, "SomeValue");
                Assert.AreEqual(val["otherpath"].Value, "SomeValue");
                Assert.AreEqual(val["nested/somepath"].Value, "SomeValue");
            });
        }

        [Test]
        public async Task CalculateFilterByMatcher()
        {
            var driver = GetTestDriver();
            var context = ContextCreator.Merge(ContextCreator.Create("device", "1"), 
                                               ContextCreator.Create("device", "2", new[] { "SomeDeviceProp", "5" }));
            var paths = new[] { "abc/somepath" };
            var rules = new[] { RuleDataCreator.CreateSingleVariantRule("abc/somepath", matcher: JsonConvert.SerializeObject(new Dictionary<string,object>()
            {
                {"device.SomeDeviceProp", 5}
            }), value: "SomeValue") };


            var scope = driver.SetTestEnviornment(context, paths, rules);
            await scope.Run(async tweek =>
            {
                var val = await tweek.Calculate("abc/_", new HashSet<Identity> { new Identity("device", "1") });
                Assert.AreEqual(0, val.Count);

                val = await tweek.Calculate("abc/_", new HashSet<Identity> { new Identity("device", "2") });
                Assert.AreEqual(val["somepath"].Value, "SomeValue");
            });
        }

        [Test]
        public async Task CalculateFilterByMatcherWithMultiIdentities()
        {
            var driver = GetTestDriver();
            var context = ContextCreator.Merge(
                                               ContextCreator.Create("user", "1", new[] { "SomeUserProp", "10" }),
                                               ContextCreator.Create("device", "1", new[] { "SomeDeviceProp", "5" }));
            var paths = new[] { "abc/somepath" };
            var rules = new[] { RuleDataCreator.CreateSingleVariantRule("abc/somepath", matcher: JsonConvert.SerializeObject(new Dictionary<string,object>()
            {
                {"user.SomeUserProp", 10},
                {"device.SomeDeviceProp", 5}
            }), value: "SomeValue") };

            var scope = driver.SetTestEnviornment(context, paths, rules);
            await scope.Run(async tweek =>
            {
                var val = await tweek.Calculate("abc/_", new HashSet<Identity> { new Identity("device", "1") });
                Assert.AreEqual(0, val.Count);
                
                val = await tweek.Calculate("abc/_", new HashSet<Identity> { new Identity("device", "1"), new Identity("user", "1") });
                Assert.AreEqual(val["somepath"].Value, "SomeValue");

                val = await tweek.Calculate("abc/_", new HashSet<Identity> { new Identity("user", "1") });
                Assert.AreEqual(0, val.Count);
            });
        }
    }
}
