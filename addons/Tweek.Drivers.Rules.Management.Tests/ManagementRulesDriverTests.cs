using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using Microsoft.Reactive.Testing;
using System.Threading.Tasks;
using Engine.Drivers.Rules;
using Xunit;

namespace Tweek.Drivers.Rules.Management.Tests
{
    public class ManagementRulesDriverTests
    {
        private TweekManagementRulesDriver mDriver;
        private readonly MockHttpGet mMockHttpGet;

        public ManagementRulesDriverTests()
        {
            mMockHttpGet = new MockHttpGet();
        }
        
        [Fact]
        public async Task WhenGivenEmptyRules_ShouldReturnExpectedVersionAndEmptyRules()
        {
            // Arrange
            var testScheduler = new TestScheduler();
            testScheduler.Stop();
            
            mDriver = TweekManagementRulesDriver.StartNew(
                mMockHttpGet.HttpGet,
                new TweekManagementRulesDriverSettings(),
                null,
                null,
                testScheduler
            );

            mMockHttpGet.Version = 10001;
            mMockHttpGet.Rules = new Dictionary<string, RuleDefinition>();
            
            // Act
            testScheduler.Start();
            var result = await mDriver.GetAllRules();
            
            // Assert
            Assert.Equal("10001", mDriver.CurrentLabel);
            Assert.Empty(result);
        }
        
        [Fact]
        public async Task WhenVersionIsNewer_ShouldUpdateTheRules()
        {
            // Arrange
            var testScheduler = new TestScheduler();

            mMockHttpGet.Rules = new Dictionary<string, RuleDefinition> {{"test_rule", new RuleDefinition()}};
            mDriver = TweekManagementRulesDriver.StartNew(
                mMockHttpGet.HttpGet,
                new TweekManagementRulesDriverSettings() {SampleIntervalInMs = 10},
                null,
                null,
                testScheduler
            );

            // Act
            mMockHttpGet.Version = 10001;
            testScheduler.AdvanceBy(TimeSpan.FromMilliseconds(11).Ticks);
            await Task.Delay(10);
            
            mMockHttpGet.Version = 10002;
            testScheduler.AdvanceBy(TimeSpan.FromMilliseconds(11).Ticks);
            await Task.Delay(10);
            
            var result = await mDriver.GetAllRules();
            
            // Assert
            Assert.Equal("10002", mDriver.CurrentLabel);
            Assert.Equal("test_rule", result.Keys.First());
        }
        
        [Fact]
        public async Task LastCheckTimeHasToBeCorrect()
        {
            // Arrange
            var testScheduler = new TestScheduler();
            var startTime = DateTime.Parse("2017-08-13T11:10:00Z").ToUniversalTime();
            testScheduler.AdvanceTo(startTime.Ticks);

            mMockHttpGet.Version = 10001;
            mMockHttpGet.Rules = new Dictionary<string, RuleDefinition> {{"test_rule", new RuleDefinition()}};
            mDriver = TweekManagementRulesDriver.StartNew(
                mMockHttpGet.HttpGet,
                new TweekManagementRulesDriverSettings {SampleIntervalInMs = (int) TimeSpan.FromHours(0.9).TotalMilliseconds},
                null,
                null,
                testScheduler
            );

            // Act
            testScheduler.AdvanceBy(TimeSpan.FromHours(1).Ticks);
            await Task.Delay(10);
            var result = await mDriver.GetAllRules();
            
            // Assert
            Assert.Equal("10001", mDriver.CurrentLabel);
            Assert.Equal("test_rule", result.Keys.First());
            Assert.Equal(startTime.Hour + 1, mDriver.LastCheckTime.Hour);
        }

        [Fact]
        public async Task RulesUpdated_OnRulesChangeEventHasBeenFired()
        {
            // Arrange
            var testScheduler = new TestScheduler();
            var timesCalled = 0;
            
            testScheduler.Stop();

            mMockHttpGet.Version = 10001;
            mMockHttpGet.Rules = new Dictionary<string, RuleDefinition>();
            mDriver = TweekManagementRulesDriver.StartNew(
                mMockHttpGet.HttpGet,
                new TweekManagementRulesDriverSettings
                {
                    SampleIntervalInMs = (int) TimeSpan.FromSeconds(1).TotalMilliseconds,
                    FailureDelayInMs = 1
                },
                null,
                null,
                testScheduler
            );

            mDriver.OnRulesChange += rules => Interlocked.Increment(ref timesCalled);

            // Act
            testScheduler.AdvanceBy(TimeSpan.FromSeconds(1.1).Ticks);
            await Task.Delay(10);
            mMockHttpGet.Version = 10002;
            testScheduler.AdvanceBy(TimeSpan.FromSeconds(1.1).Ticks);
            await Task.Delay(10);
            mMockHttpGet.Version = 10003;
            testScheduler.AdvanceBy(TimeSpan.FromSeconds(1.1).Ticks);
            await Task.Delay(10);
            
            // Assert
            Assert.Equal("10003", mDriver.CurrentLabel);
            Assert.Equal(3, timesCalled);
        }
    }
}