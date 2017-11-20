using Engine.DataTypes;
using Engine.Drivers.Context;
using Engine.Drivers.Rules;
using Engine.Tests.Helpers;
using Engine.Tests.TestDrivers;
using FSharpUtils.Newtonsoft;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Tweek.Engine;
using Tweek.JPad.Generator;
using Xunit;
using MatcherData = System.Collections.Generic.Dictionary<string, object>;

namespace Engine.Tests
{
    public class TestDriverFixture
    {
        public ITestDriver Driver { get; set; }
        public TestDriverFixture()
        {
            Driver = new InMemoryTestDriver();
        }
    }

    public class EngineTests : IClassFixture<TestDriverFixture>
    {
        ITestDriver driver;
        Dictionary<Identity, Dictionary<string, JsonValue>> contexts;
        Dictionary<string, RuleDefinition> rules;
        string[] paths;

        readonly HashSet<Identity> NoIdentities = new HashSet<Identity>();
        readonly Dictionary<Identity, Dictionary<string, JsonValue>> EmptyContexts = new Dictionary<Identity, Dictionary<string, JsonValue>>();

        public EngineTests(TestDriverFixture fixture)
        {
            driver = fixture.Driver;
        }

        async Task Run(Func<ITweek, IContextDriver, Task> test)
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

            await Run(async (tweek, context) =>
            {
                var val = await tweek.GetContextAndCalculate("_", NoIdentities, context);
                Assert.Equal("SomeValue", val["abc/somepath"].Value.AsString());

                val = await tweek.GetContextAndCalculate("abc/_", NoIdentities, context);
                Assert.Equal( "SomeValue", val["abc/somepath"].Value.AsString());

                val = await tweek.GetContextAndCalculate("abc/somepath", NoIdentities, context);
                Assert.Equal( "SomeValue", val["abc/somepath"].Value.AsString());
            });
        }

        [Fact]
        public async Task CalculateMultipleValues()
        {
            contexts = EmptyContexts;
            paths = new[] { "abc/somepath", "abc/otherpath", "abc/nested/somepath", "def/somepath" };
            rules = paths.ToDictionary(x => x,
                x => JPadGenerator.New().AddSingleVariantRule(matcher: "{}", value: "SomeValue").Generate());

            await Run(async (tweek, context) =>
            {
                var val = await tweek.GetContextAndCalculate("abc/_", NoIdentities, context);
                Assert.Equal(3, val.Count);
                Assert.Equal("SomeValue",val["abc/somepath"].Value.AsString());
                Assert.Equal("SomeValue",val["abc/otherpath"].Value.AsString());
                Assert.Equal("SomeValue",val["abc/nested/somepath"].Value.AsString());
            });
        }

        [Fact]
        public async Task CalculateMultiplePathQueries()
        {
            contexts = EmptyContexts;
            paths = new[] { "abc/somepath", "abc/otherpath", "abc/nested/somepath", "def/somepath", "xyz/somepath" };
            rules = paths.ToDictionary(x => x,
                x => JPadGenerator.New().AddSingleVariantRule(matcher: "{}", value: "SomeValue").Generate());

            await Run(async (tweek, context) =>
            {
                var val = await tweek.GetContextAndCalculate(new List<ConfigurationPath>{"abc/_", "def/_"}, NoIdentities, context);
                Assert.Equal(4, val.Count);
                Assert.Equal("SomeValue", val["abc/somepath"].Value.AsString());
                Assert.Equal("SomeValue", val["abc/otherpath"].Value.AsString());
                Assert.Equal("SomeValue", val["abc/nested/somepath"].Value.AsString());
                Assert.Equal("SomeValue", val["def/somepath"].Value.AsString());
            });
        }

        [Fact]
        public async Task CalculateMultiplePathQueriesWithOverlap()
        {
            contexts = EmptyContexts;
            paths = new[] { "abc/somepath", "abc/otherpath", "abc/nested/somepath", "def/somepath", "xyz/somepath" };
            rules = paths.ToDictionary(x => x,
                x => JPadGenerator.New().AddSingleVariantRule(matcher: "{}", value: "SomeValue").Generate());

            await Run(async (tweek, context) =>
            {
                var val = await tweek.GetContextAndCalculate(new List<ConfigurationPath> { "abc/_", "abc/nested/_" }, NoIdentities, context);
                Assert.Equal(3, val.Count);
                Assert.Equal("SomeValue", val["abc/somepath"].Value.AsString());
                Assert.Equal("SomeValue", val["abc/otherpath"].Value.AsString());
                Assert.Equal("SomeValue", val["abc/nested/somepath"].Value.AsString());
            });
        }

        [Fact]
        public async Task CalculateFilterByMatcher()
        {
            contexts = ContextCreator.Merge(ContextCreator.Create("device", "1"), 
                                            ContextCreator.Create("device", "2",  Tuple.Create("SomeDeviceProp", JsonValue.NewNumber(10) )),
                                            ContextCreator.Create("device", "3",  Tuple.Create("SomeDeviceProp", JsonValue.NewNumber(5)) ));

            paths = new[] { "abc/somepath" };
            rules = new Dictionary<string, RuleDefinition>
            {
                ["abc/somepath"] = JPadGenerator.New().AddSingleVariantRule(matcher: JsonConvert.SerializeObject(new MatcherData
                        {
                            ["device.SomeDeviceProp"]= 5
                        }), value: "SomeValue").Generate()
            };

            await Run(async (tweek, context) =>
            {
                var val = await tweek.GetContextAndCalculate("abc/_", new HashSet<Identity> { new Identity("device", "1") }, context);
                Assert.Equal(0, val.Count);

                val = await tweek.GetContextAndCalculate("abc/_", new HashSet<Identity> { new Identity("device", "2") }, context);
                Assert.Equal(0, val.Count);

                val = await tweek.GetContextAndCalculate("abc/_", new HashSet<Identity> { new Identity("device", "3") }, context);
                Assert.Equal("SomeValue", val["abc/somepath"].Value.AsString());
            });
        }

        [Fact]
        public async Task CalculateFilterByMatcherWithMultiIdentities()
        {
            contexts = ContextCreator.Merge(
                                               ContextCreator.Create("user", "1", Tuple.Create("SomeUserProp", JsonValue.NewNumber(10)) ),
                                               ContextCreator.Create("device", "1", Tuple.Create("SomeDeviceProp", JsonValue.NewNumber(5))));
            paths = new[] { "abc/somepath" };
            rules = new Dictionary<string, RuleDefinition>
            {
                ["abc/somepath"] = JPadGenerator.New().AddSingleVariantRule(matcher: JsonConvert.SerializeObject(new MatcherData
                {
                    ["device.SomeDeviceProp"] = 5,
                    ["user.SomeUserProp"] = 10
                }), value: "SomeValue").Generate()
            };

            await Run(async (tweek, context) =>
            {
                var val = await tweek.GetContextAndCalculate("abc/_", new HashSet<Identity> { new Identity("device", "1") }, context);
                Assert.Equal(0, val.Count);
                
                val = await tweek.GetContextAndCalculate("abc/_", new HashSet<Identity> { new Identity("user", "1") }, context);
                Assert.Equal(0, val.Count);

                val = await tweek.GetContextAndCalculate("abc/_", new HashSet<Identity> { new Identity("device", "1"), new Identity("user", "1") }, context);
                Assert.Equal("SomeValue", val["abc/somepath"].Value.AsString());
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

            await Run(async (tweek, context) =>
            {
                var val = await tweek.GetContextAndCalculate("abc/_", new HashSet<Identity> { new Identity("device", "1") }, context);
                Assert.Equal( "SomeValue", val["abc/somepath"].Value.AsString());
            });
        }

        [Fact]
        public async Task MultipleRulesWithFallback()
        {
            contexts = ContextCreator.Create("device", "1", Tuple.Create("SomeDeviceProp", JsonValue.NewNumber(5)));
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


            await Run(async (tweek, context) =>
            {
                var val = await tweek.GetContextAndCalculate("abc/_", new HashSet<Identity> { new Identity("device", "1") }, context);
                Assert.Equal("SomeValue", val["abc/somepath"].Value.AsString());
            });
        }

        [Fact]
        public async Task CalculateWithMultiVariant()
        {
            contexts = ContextCreator.Create("device", "1", Tuple.Create("SomeDeviceProp", JsonValue.NewNumber(5)));
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
            
            await Run(async (tweek, context) =>
            {
                var val = await tweek.GetContextAndCalculate("abc/_", new HashSet<Identity> { }, context);
                Assert.Equal(0, val.Count);
                val = await tweek.GetContextAndCalculate("abc/_", new HashSet<Identity> { new Identity("device", "1")}, context);
                Assert.True(val["abc/somepath"].Value.AsString() == "true" || val["abc/somepath"].Value.AsString() == "false");
                await Task.WhenAll(Enumerable.Range(0, 10).Select(async x =>
                {
                    Assert.Equal((await tweek.GetContextAndCalculate("abc/_", new HashSet<Identity> { new Identity("device", "1") }, context))["abc/somepath"].Value, val["abc/somepath"].Value);
                }));
            });
        }

        [Fact]
        public async Task ContextKeysShouldBeCaseInsensitive()
        {
            contexts = ContextCreator.Create("device", "1", Tuple.Create("someDeviceProp", JsonValue.NewNumber(5)));
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

            await Run(async (tweek, context) =>
            {
                var val = await tweek.GetContextAndCalculate("abc/_", new HashSet<Identity> { new Identity("device", "1") }, context);
                Assert.Equal("true", val["abc/somepath"].Value.AsString());
            });
        }

        [Fact]
        public async Task RuleUsingTimeBasedOperators()
        {
            contexts = ContextCreator.Merge(
                ContextCreator.Create("device", "1", Tuple.Create("birthday", JsonValue.NewString(DateTime.UtcNow.AddDays(-2).ToString("u")))),
                ContextCreator.Create("device", "2", Tuple.Create("birthday", JsonValue.NewString(DateTime.UtcNow.AddDays(-5).ToString("u")))));

            paths = new[] { "abc/somepath" };
            rules = new Dictionary<string, RuleDefinition>()
            {
                ["abc/somepath"] =
                    JPadGenerator.New()
                        .AddSingleVariantRule(JsonConvert.SerializeObject(new Dictionary<string, object>()
                        {
                            {"Device.birthday", new Dictionary<string, object>()
                                {
                                    {"$withinTime", "3d"}
                                }}
                        }), value: "true")
                        .AddSingleVariantRule(JsonConvert.SerializeObject(new {}), value: "false")
                        .Generate()
            };

            await Run(async (tweek, context) =>
            {
                var val = await tweek.GetContextAndCalculate("abc/_", new HashSet<Identity> { new Identity("device", "1") }, context);
                Assert.Equal("true", val["abc/somepath"].Value.AsString());

                val = await tweek.GetContextAndCalculate("abc/_", new HashSet<Identity> { new Identity("device", "2") }, context);
                Assert.Equal("false", val["abc/somepath"].Value.AsString());

            });
        }

        [Fact]
        public async Task CalculateWithFixedValue()
        {
            contexts = ContextCreator.Merge(ContextCreator.Create("device", "1", Tuple.Create("@fixed:abc/somepath", JsonValue.NewString("FixedValue"))),
                                            ContextCreator.Create("device", "2", Tuple.Create("SomeDeviceProp", JsonValue.NewNumber(5))),
                                            ContextCreator.Create("device", "3", Tuple.Create("SomeDeviceProp", JsonValue.NewNumber(5)), Tuple.Create("@fixed:abc/somepath", JsonValue.NewString("FixedValue"))));

            paths = new[] { "abc/somepath" };
            rules = new Dictionary<string, RuleDefinition>()
            {
                ["abc/somepath"] = JPadGenerator.New().AddSingleVariantRule(matcher: JsonConvert.SerializeObject(new Dictionary<string, object>()
            {
                {"device.SomeDeviceProp", 5}
            }), value: "RuleBasedValue").Generate()
            };


            await Run(async (tweek, context) =>
            {
                var val = await tweek.GetContextAndCalculate("abc/_", new HashSet<Identity> { new Identity("device", "1") }, context);
                Assert.Equal("FixedValue", val["abc/somepath"].Value.AsString());

                val = await tweek.GetContextAndCalculate("abc/_", new HashSet<Identity> { new Identity("device", "2") }, context);
                Assert.Equal("RuleBasedValue", val["abc/somepath"].Value.AsString());

                val = await tweek.GetContextAndCalculate("abc/_", new HashSet<Identity> { new Identity("device", "3") }, context);
                Assert.Equal("FixedValue", val["abc/somepath"].Value.AsString());
                
            });
        }

        [Fact]
        public async Task CalculateWithRecursiveMatcher()
        {
            contexts = ContextCreator.Merge(
                            ContextCreator.Create("device", "1", Tuple.Create("SomeDeviceProp", JsonValue.NewNumber(5))),
                            ContextCreator.Create("device", "2", Tuple.Create("@fixed:abc/dep_path2", JsonValue.NewBoolean(true)), Tuple.Create("SomeDeviceProp", JsonValue.NewNumber(5))) 
                            );

            paths = new[] { "abc/somepath", "abc/dep_path1", "abc/dep_path2" };

            rules = new Dictionary<string, RuleDefinition>()
            {
                ["abc/dep_path1"] = JPadGenerator.New().AddSingleVariantRule(matcher: JsonConvert.SerializeObject(new Dictionary<string, object>()
            {
                {"device.SomeDeviceProp", 5}
            }), value: true).Generate(),
                ["abc/somepath"] = JPadGenerator.New().AddSingleVariantRule(matcher: JsonConvert.SerializeObject(new Dictionary<string, object>()
            {
                {"@@key:abc/dep_path1", true},
                {"keys.abc/dep_path2", true}
            }),
                value: true).Generate()
            };

            await Run(async (tweek, context) =>
            {
                var val = await tweek.GetContextAndCalculate("abc/_", new HashSet<Identity> { new Identity("device", "1") }, context);
                Assert.Equal(1, val.Count);
                Assert.Equal("true", val["abc/dep_path1"].Value.AsString());

                val = await tweek.GetContextAndCalculate("abc/_", new HashSet<Identity> { new Identity("device", "2") }, context);
                Assert.Equal(3, val.Count);
                Assert.Equal("true", val["abc/dep_path1"].Value.AsString());
                Assert.Equal("true", val["abc/dep_path2"].Value.AsString());
                Assert.Equal("true", val["abc/somepath"].Value.AsString());
            });
        }



    }
}
