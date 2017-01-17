using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Couchbase;
using Engine.DataTypes;
using Engine.Drivers.Rules;
using Engine.Tests.Helpers;
using Engine.Tests.TestDrivers;
using Newtonsoft.Json;
using Xunit;
using Tweek.JPad.Generator;
using MatcherData = System.Collections.Generic.Dictionary<string, object>;
using Couchbase.Configuration.Client;
using FSharp.Data;

namespace Engine.Tests
{
    public class CouchBaseFixture
    {
        public ITestDriver Driver { get; set; }
        public CouchBaseFixture()
        {
            var bucketName = "tweek-tests";
            var cluster = new Cluster(new ClientConfiguration
            {
                Servers = new List<Uri> { new Uri("http://couchbase-07cc5a45.b5501720.svc.dockerapp.io:8091/pools") },
                BucketConfigs = new Dictionary<string, BucketConfiguration>
                {
                    [bucketName] = new BucketConfiguration
                    {
                        BucketName = bucketName,
                        Password = "po09!@QW"
                    }
                },
                Serializer = () => new Couchbase.Core.Serialization.DefaultSerializer(
                   new JsonSerializerSettings()
                   {
                       ContractResolver = new Newtonsoft.Json.Serialization.DefaultContractResolver()
                   },
                   new JsonSerializerSettings()
                   {
                       ContractResolver = new Newtonsoft.Json.Serialization.DefaultContractResolver()
                   })
            });

            Driver = new CouchbaseTestDriver(cluster, bucketName);
        }
    }

    public class EngineIntegrationTests : IClassFixture<CouchBaseFixture>
    {
        ITestDriver driver;
        Dictionary<Identity, Dictionary<string, string>> contexts;
        Dictionary<string, RuleDefinition> rules;
        string[] paths;

        readonly HashSet<Identity> NoIdentities = new HashSet<Identity>();
        readonly Dictionary<Identity, Dictionary<string, string>> EmptyContexts = new Dictionary<Identity, Dictionary<string, string>>();

        public EngineIntegrationTests(CouchBaseFixture fixture)
        {
            driver = fixture.Driver;
        }

        async Task Run(Func<ITweek, Task> test)
        {
            var scope = driver.SetTestEnviornment(contexts, paths, rules);
            await scope.Run(test);
        }

        [Fact]
        public async Task CalculateSingleValue()
        {
            contexts = EmptyContexts;
            paths = new[] {"abc/somepath"};
            rules = new Dictionary<string, RuleDefinition>
            {
                ["abc/somepath"] = JPadGenerator.New().AddSingleVariantRule(matcher: "{}", value: "SomeValue").Generate()
            };

            await Run(async tweek =>
            {
                var val = await tweek.Calculate("_", NoIdentities);
                Assert.Equal("SomeValue", val["abc/somepath"].Value.AsString());

                val = await tweek.Calculate("abc/_", NoIdentities);
                Assert.Equal( "SomeValue", val["somepath"].Value.AsString());

                val = await tweek.Calculate("abc/somepath", NoIdentities);
                Assert.Equal( "SomeValue", val[""].Value.AsString());
            });
        }

        [Fact]
        public async Task CalculateMultipleValues()
        {
            contexts = EmptyContexts;
            paths = new[] { "abc/somepath", "abc/otherpath", "abc/nested/somepath", "def/somepath" };
            rules = paths.ToDictionary(x => x,
                x => JPadGenerator.New().AddSingleVariantRule(matcher: "{}", value: "SomeValue").Generate());

            await Run(async tweek =>
            {
                var val = await tweek.Calculate("abc/_", NoIdentities);
                Assert.Equal(3, val.Count);
                Assert.Equal("SomeValue",val["somepath"].Value.AsString());
                Assert.Equal("SomeValue",val["otherpath"].Value.AsString());
                Assert.Equal("SomeValue",val["nested/somepath"].Value.AsString());
            });
        }

        [Fact]
        public async Task CalculateFilterByMatcher()
        {
            contexts = ContextCreator.Merge(ContextCreator.Create("device", "1"), 
                                            ContextCreator.Create("device", "2", new[] { "SomeDeviceProp", "10" }),
                                            ContextCreator.Create("device", "3", new[] { "SomeDeviceProp", "5" }));

            paths = new[] { "abc/somepath" };
            rules = new Dictionary<string, RuleDefinition>
            {
                ["abc/somepath"] = JPadGenerator.New().AddSingleVariantRule(matcher: JsonConvert.SerializeObject(new MatcherData
                        {
                            ["device.SomeDeviceProp"]= 5
                        }), value: "SomeValue").Generate()
            };

            await Run(async tweek =>
            {
                var val = await tweek.Calculate("abc/_", new HashSet<Identity> { new Identity("device", "1") });
                Assert.Equal(0, val.Count);

                val = await tweek.Calculate("abc/_", new HashSet<Identity> { new Identity("device", "2") });
                Assert.Equal(0, val.Count);

                val = await tweek.Calculate("abc/_", new HashSet<Identity> { new Identity("device", "3") });
                Assert.Equal("SomeValue", val["somepath"].Value.AsString());
            });
        }

        [Fact]
        public async Task CalculateFilterByMatcherWithMultiIdentities()
        {
            contexts = ContextCreator.Merge(
                                               ContextCreator.Create("user", "1", new[] { "SomeUserProp", "10" }),
                                               ContextCreator.Create("device", "1", new[] { "SomeDeviceProp", "5" }));
            paths = new[] { "abc/somepath" };
            rules = new Dictionary<string, RuleDefinition>
            {
                ["abc/somepath"] = JPadGenerator.New().AddSingleVariantRule(matcher: JsonConvert.SerializeObject(new MatcherData
                {
                    ["device.SomeDeviceProp"] = 5,
                    ["user.SomeUserProp"] = 10
                }), value: "SomeValue").Generate()
            };

            await Run(async tweek =>
            {
                var val = await tweek.Calculate("abc/_", new HashSet<Identity> { new Identity("device", "1") });
                Assert.Equal(0, val.Count);
                
                val = await tweek.Calculate("abc/_", new HashSet<Identity> { new Identity("user", "1") });
                Assert.Equal(0, val.Count);

                val = await tweek.Calculate("abc/_", new HashSet<Identity> { new Identity("device", "1"), new Identity("user", "1") });
                Assert.Equal("SomeValue", val["somepath"].Value.AsString());
            });
        }

        [Fact]
        public async Task MultipleRules()
        {
            contexts = ContextCreator.Create("device", "1");
            paths = new[] { "abc/somepath" };
            rules = new Dictionary<string, RuleDefinition>
            {
                ["abc/otherpath"] = JPadGenerator.New().AddSingleVariantRule(matcher: "{}", value: "BadValue").Generate(),
                ["abc/somepath"] = JPadGenerator.New().AddSingleVariantRule(matcher: "{}", value: "SomeValue")
                                                      .AddSingleVariantRule(matcher: "{}", value: "BadValue").Generate(),
            };

            await Run(async tweek =>
            {
                var val = await tweek.Calculate("abc/_", new HashSet<Identity> { new Identity("device", "1") });
                Assert.Equal( "SomeValue", val["somepath"].Value.AsString());
            });
        }

        [Fact]
        public async Task MultipleRulesWithFallback()
        {
            contexts = ContextCreator.Create("device", "1", new[] { "SomeDeviceProp", "5" });
            paths = new[] { "abc/somepath" };

            rules = new Dictionary<string, RuleDefinition>
            {
                ["abc/somepath"] = JPadGenerator.New().AddSingleVariantRule(matcher: JsonConvert.SerializeObject(new MatcherData()
                {
                    { "device.SomeDeviceProp", 10}
                }), value: "BadValue")
                .AddSingleVariantRule(matcher: JsonConvert.SerializeObject(new Dictionary<string, object>()
                {
                    {"device.SomeDeviceProp", 5}
                }), value: "SomeValue").Generate(),
            };


            await Run(async tweek =>
            {
                var val = await tweek.Calculate("abc/_", new HashSet<Identity> { new Identity("device", "1") });
                Assert.Equal("SomeValue", val["somepath"].Value.AsString());
            });
        }

        [Fact]
        public async Task CalculateWithMultiVariant()
        {
            contexts = ContextCreator.Create("device", "1", new[] { "SomeDeviceProp", "5"}, new []{"@CreationDate", "10/10/10" });
            paths = new[] { "abc/somepath" };
            rules = new Dictionary<string, RuleDefinition>()
            {
                ["abc/somepath"] =
                    JPadGenerator.New()
                        .AddMultiVariantRule(matcher: JsonConvert.SerializeObject(new Dictionary<string, object>()
                        {
                            {"device.SomeDeviceProp", 5}
                        }), valueDistrubtions: JsonConvert.SerializeObject(new
                                {
                                    type = "bernoulliTrial",
                                    args = 0.5
                                }), ownerType: "device").Generate()
            };
            
            await Run(async tweek =>
            {
                var val = await tweek.Calculate("abc/_", new HashSet<Identity> { });
                Assert.Equal(0, val.Count);
                val = await tweek.Calculate("abc/_", new HashSet<Identity> { new Identity("device", "1")});
                Assert.True(val["somepath"].Value.AsString() == "true" || val["somepath"].Value.AsString() == "false");
                await Task.WhenAll(Enumerable.Range(0, 10).Select(async x =>
                {
                    Assert.Equal((await tweek.Calculate("abc/_", new HashSet<Identity> { new Identity("device", "1") }))["somepath"].Value, val["somepath"].Value);
                }));
            });
        }

        [Fact]
        public async Task ContextKeysShouldBeCaseInsensitive()
        {
            contexts = ContextCreator.Create("device", "1", new[] { "someDeviceProp", "5" });
            paths = new[] { "abc/somepath" };
            rules = new Dictionary<string, RuleDefinition>()
            {
                ["abc/somepath"] =
                    JPadGenerator.New()
                        .AddSingleVariantRule(matcher: JsonConvert.SerializeObject(new Dictionary<string, object>()
                        {
                            {"Device.sOmeDeviceProp", 5}
                        }), value: "true").Generate()
            };

            await Run(async tweek =>
            {
                var val = await tweek.Calculate("abc/_", new HashSet<Identity> { new Identity("device", "1") });
                Assert.Equal("true", val["somepath"].Value.AsString());
            });
        }

        /*
        [Fact]
        public async Task MultiVariantWithMultipleValueDistrubtion()
        {
            contexts = ContextCreator.Merge(
                       ContextCreator.Create("device", "1", new[] { "@CreationDate", "05/05/05" }),
                       ContextCreator.Create("device", "2", new[] { "@CreationDate", "07/07/07" }),
                       ContextCreator.Create("device", "3", new[] { "@CreationDate", "09/09/09" }),
                       ContextCreator.Create("user", "4", new[] { "@CreationDate", "09/09/09" }));

            paths = new[] { "abc/somepath" };
            rules = new Dictionary<string, RuleDefinition>()
            {
                ["abc/somepath"] = JPadGenerator.New().AddMultiVariantRule(matcher: "{}",
                    valueDistrubtions: new Dictionary<DateTimeOffset, string>
                    {
                        [DateTimeOffset.Parse("06/06/06")] = JsonConvert.SerializeObject(new
                        {
                            type = "bernoulliTrial",
                            args = 1
                        }),
                        [DateTimeOffset.Parse("08/08/08")] = JsonConvert.SerializeObject(new
                        {
                            type = "bernoulliTrial",
                            args = 0
                        })
                    }, ownerType: "device").Generate()
            };

            await Run(async tweek =>
            {
                var val = await tweek.Calculate("abc/_", new HashSet<Identity> { new Identity("device", "1") });
                Assert.Equal(0, val.Count);

                val = await tweek.Calculate("abc/_", new HashSet<Identity> { new Identity("device", "2") });
                Assert.Equal("true", val["somepath"].Value);

                val = await tweek.Calculate("abc/_", new HashSet<Identity> { new Identity("device", "3") });
                Assert.Equal("false", val["somepath"].Value);

                val = await tweek.Calculate("abc/_", new HashSet<Identity> { new Identity("user", "4") });
                Assert.Equal(0, val.Count);
            });
        }*/

        [Fact]
        public async Task CalculateWithFixedValue()
        {
            contexts = ContextCreator.Merge(ContextCreator.Create("device", "1", new[] { "@fixed:abc/somepath", "FixedValue" }),
                                            ContextCreator.Create("device", "2", new[] { "SomeDeviceProp", "5" }),
                                            ContextCreator.Create("device", "3", new[] { "SomeDeviceProp", "5" }, new[] { "@fixed:abc/somepath", "FixedValue" }));

            paths = new[] { "abc/somepath" };
            rules = new Dictionary<string, RuleDefinition>()
            {
                ["abc/somepath"] = JPadGenerator.New().AddSingleVariantRule(matcher: JsonConvert.SerializeObject(new Dictionary<string, object>()
            {
                {"device.SomeDeviceProp", 5}
            }), value: "RuleBasedValue").Generate()
            };


            await Run(async tweek =>
            {
                var val = await tweek.Calculate("abc/_", new HashSet<Identity> { new Identity("device", "1") });
                Assert.Equal("FixedValue", val["somepath"].Value.AsString());

                val = await tweek.Calculate("abc/_", new HashSet<Identity> { new Identity("device", "2") });
                Assert.Equal("RuleBasedValue", val["somepath"].Value.AsString());

                val = await tweek.Calculate("abc/_", new HashSet<Identity> { new Identity("device", "3") });
                Assert.Equal("FixedValue", val["somepath"].Value.AsString());
                
            });
        }

        [Fact]
        public async Task CalculateWithRecursiveMatcher()
        {
            contexts = ContextCreator.Merge(
                            ContextCreator.Create("device", "1", new[] { "SomeDeviceProp", "5" }),
                            ContextCreator.Create("device", "2", new[] { "@fixed:abc/dep_path2", "true" }, new[] { "SomeDeviceProp", "5" })
                            );

            paths = new[] { "abc/somepath", "abc/dep_path1", "abc/dep_path2" };

            rules = new Dictionary<string, RuleDefinition>()
            {
                ["abc/dep_path1"] = JPadGenerator.New().AddSingleVariantRule(matcher: JsonConvert.SerializeObject(new Dictionary<string, object>()
            {
                {"device.SomeDeviceProp", 5}
            }), value: "true").Generate(),
                ["abc/somepath"] = JPadGenerator.New().AddSingleVariantRule(matcher: JsonConvert.SerializeObject(new Dictionary<string, object>()
            {
                {"@@key:abc/dep_path1", true},
                {"@@key:abc/dep_path2", true}
            }),
                value: "true").Generate()
            };

            await Run(async tweek =>
            {
                var val = await tweek.Calculate("abc/_", new HashSet<Identity> { new Identity("device", "1") });
                Assert.Equal(1, val.Count);
                Assert.Equal("true", val["dep_path1"].Value.AsString());

                val = await tweek.Calculate("abc/_", new HashSet<Identity> { new Identity("device", "2") });
                Assert.Equal(3, val.Count);
                Assert.Equal("true", val["dep_path1"].Value.AsString());
                Assert.Equal("true", val["dep_path2"].Value.AsString());
                Assert.Equal("true", val["somepath"].Value.AsString());
            });
        }

    }
}
