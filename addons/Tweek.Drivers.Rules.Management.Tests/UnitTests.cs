using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading;
using Microsoft.Reactive.Testing;
using Microsoft.Extensions.Logging.Console;
using System.Threading.Tasks;
using Engine.Drivers.Rules;
using Newtonsoft.Json;
using Xunit;

namespace Tweek.Drivers.Rules.Management.Tests
{
    public class UnitTests
    {
        private TweekManagementRulesDriver mDriver;
        
        public UnitTests()
        {
        }

        private static HttpGet CreateRulesResponse(int version, IDictionary<string, RuleDefinition> rules)
        {
            var versionString = version.ToString();
            var versionResponse = Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(versionString)
            });
            var rulesResponse = Task.FromResult(new HttpResponseMessage
            {
                Headers = {{"X-Rules-Version", new[] {versionString}}},
                Content = new StringContent(JsonConvert.SerializeObject(rules))
            });

            return url =>
            {
                if (url == "/ruleset/latest/version")
                {
                    return versionResponse;
                }
                if (url == "/ruleset/latest")
                {
                    return rulesResponse;
                }
                return Task.FromResult(new HttpResponseMessage(HttpStatusCode.BadRequest));
            };
        }

        private static HttpGet CreateMultipleRulesResponses(params HttpGet[] responses)
        {
            var callCount = 0;
            return url =>
            {
                callCount++;
                if (callCount > responses.Length)
                {
                    return responses[responses.Length - 1](url);
                }
                return responses[callCount - 1](url);
            };
        }
        
        [Fact]
        public async Task WhenGivenEmptyRules_ShouldReturnExpectedVersionAndEmptyRules()
        {
            var testScheduler = new TestScheduler();
            testScheduler.Stop();
            
            mDriver = TweekManagementRulesDriver.StartNew(
                CreateRulesResponse(12345, new Dictionary<string, RuleDefinition>()),
                new TweekManagementRulesDriverSettings(),
                new ConsoleLogger("test", (msg, level) => true, true),
                null,
                testScheduler
            );

            testScheduler.Start();
            var result = await mDriver.GetAllRules();
            
            Assert.Equal("12345", mDriver.CurrentLabel);
            Assert.Empty(result);
        }
        
        [Fact]
        public async Task WhenVersionIsNewer_ShouldUpdateTheRules()
        {
            var testScheduler = new TestScheduler();

            var newRules = new Dictionary<string, RuleDefinition> {{"test_rule", new RuleDefinition()}};
            mDriver = TweekManagementRulesDriver.StartNew(
                CreateMultipleRulesResponses(
                    CreateRulesResponse(12345, new Dictionary<string, RuleDefinition> ()),
                    CreateRulesResponse(12346, newRules)
                ),
                new TweekManagementRulesDriverSettings() {SampleIntervalInMs = 10},
                new ConsoleLogger("test", (msg, level) => true, true),
                null,
                testScheduler
            );

            testScheduler.AdvanceBy(TimeSpan.FromMilliseconds(10).Ticks);
            var result = await mDriver.GetAllRules();
            Assert.Equal("12346", mDriver.CurrentLabel);
            Assert.Equal("test_rule", newRules.Keys.First());
        }
        
        [Fact]
        public async Task LastCheckTimeHasToBeCorrect()
        {
            var testScheduler = new TestScheduler();
            var startTime = DateTime.Parse("2017-08-13T11:10:00Z");
            testScheduler.AdvanceTo(startTime.Ticks);

            var newRules = new Dictionary<string, RuleDefinition> {{"test_rule", new RuleDefinition()}};
            mDriver = TweekManagementRulesDriver.StartNew(
                CreateMultipleRulesResponses(
                    CreateRulesResponse(12345, new Dictionary<string, RuleDefinition> ()),
                    CreateRulesResponse(12346, newRules)
                ),
                new TweekManagementRulesDriverSettings() {SampleIntervalInMs = (int) TimeSpan.FromHours(0.9).TotalMilliseconds},
                new ConsoleLogger("test", (msg, level) => true, true),
                null,
                testScheduler
            );

            testScheduler.AdvanceBy(TimeSpan.FromHours(1).Ticks);
            var result = await mDriver.GetAllRules();
            Assert.Equal("12346", mDriver.CurrentLabel);
            Assert.Equal("test_rule", newRules.Keys.First());
            Assert.Equal(startTime.Hour + 1, mDriver.LastCheckTime.Hour);
        }

        [Fact]
        public async Task RulesUpdated_OnRulesChangeEventHasBeenFired()
        {
            var testScheduler = new TestScheduler();
            var timesCalled = 0;

            mDriver = TweekManagementRulesDriver.StartNew(
                CreateMultipleRulesResponses(
                    CreateRulesResponse(12345, new Dictionary<string, RuleDefinition> ()),
                    CreateRulesResponse(12345, new Dictionary<string, RuleDefinition> ()),
                    CreateRulesResponse(12346, new Dictionary<string, RuleDefinition> ()),
                    CreateRulesResponse(12346, new Dictionary<string, RuleDefinition> ()),
                    CreateRulesResponse(12347, new Dictionary<string, RuleDefinition> ()),
                    CreateRulesResponse(12347, new Dictionary<string, RuleDefinition> ())
                ),
                new TweekManagementRulesDriverSettings() {SampleIntervalInMs = (int) TimeSpan.FromSeconds(1).TotalMilliseconds},
                new ConsoleLogger("test", (msg, level) => true, true),
                null,
                testScheduler
            );

            mDriver.OnRulesChange += rules => Interlocked.Increment(ref timesCalled);

            testScheduler.AdvanceBy(TimeSpan.FromSeconds(1).Ticks);
            testScheduler.AdvanceBy(TimeSpan.FromSeconds(1).Ticks);
            testScheduler.AdvanceBy(TimeSpan.FromSeconds(1.1).Ticks);
            await mDriver.GetAllRules();
            Assert.Equal("12347", mDriver.CurrentLabel);
            Assert.Equal(3, timesCalled);
        }
    }
}