using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Engine.Drivers.Rules;
using Microsoft.Reactive.Testing;
using Moq;
using Xunit;

namespace Tweek.Drivers.Rules.Minio.Tests
{
    public class MinioRulesDriverTests
    {
        [Fact]
        public async Task WhenGivenEmptyRules_ShouldReturnExpectedVersionAndEmptyRules()
        {
            // Arrange
            var testScheduler = new TestScheduler();
            testScheduler.Stop();

            var clientMock = new Mock<IRulesClient>();

            var driver = new MinioRulesDriver(clientMock.Object, new MinioRulesDriverSettings(), null, testScheduler);

            clientMock.Setup(x => x.GetVersion(It.IsAny<CancellationToken>())).Returns(Task.FromResult("10001"));
            clientMock.Setup(x => x.GetRuleset(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .Returns(Task.FromResult(new Dictionary<string, RuleDefinition>()));

            // Act
            testScheduler.Start();
            var result = await driver.GetAllRules();

            // Assert
            Assert.Equal("10001", driver.CurrentLabel);
            Assert.Empty(result);
        }

        [Fact]
        public async Task WhenVersionIsNewer_ShouldUpdateTheRules()
        {
            // Arrange
            var testScheduler = new TestScheduler();
            testScheduler.Stop();

            var clientMock = new Mock<IRulesClient>();

            var settings = new MinioRulesDriverSettings {SampleIntervalInMs = 10};
            var driver = new MinioRulesDriver(clientMock.Object, settings, null, testScheduler);

            // Act/Assert
            clientMock.Setup(x => x.GetVersion(It.IsAny<CancellationToken>())).Returns(Task.FromResult("10001"));
            clientMock.Setup(x => x.GetRuleset(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .Returns(Task.FromResult(
                    new Dictionary<string, RuleDefinition> {{"test_rule1", new RuleDefinition()}}));

            testScheduler.AdvanceBy(TimeSpan.FromMilliseconds(11).Ticks);
            await Task.Delay(10);

            var result = await driver.GetAllRules();
            Assert.Equal("10001", driver.CurrentLabel);
            Assert.Equal("test_rule1", result.Keys.Single());

            clientMock.Setup(x => x.GetVersion(It.IsAny<CancellationToken>())).Returns(Task.FromResult("10002"));
            clientMock.Setup(x => x.GetRuleset(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .Returns(Task.FromResult(
                    new Dictionary<string, RuleDefinition> {{"test_rule2", new RuleDefinition()}}));

            testScheduler.AdvanceBy(TimeSpan.FromMilliseconds(11).Ticks);
            await Task.Delay(10);

            result = await driver.GetAllRules();
            Assert.Equal("10002", driver.CurrentLabel);
            Assert.Equal("test_rule2", result.Keys.Single());
        }

        [Fact]
        public async Task LastCheckTimeHasToBeCorrect()
        {
            // Arrange
            var testScheduler = new TestScheduler();
            var startTime = DateTime.Parse("2017-08-13T11:10:00Z").ToUniversalTime();
            testScheduler.AdvanceTo(startTime.Ticks);

            var clientMock = new Mock<IRulesClient>();

            var settings =
                new MinioRulesDriverSettings {SampleIntervalInMs = (int) TimeSpan.FromHours(0.9).TotalMilliseconds};
            var driver = new MinioRulesDriver(clientMock.Object, settings, null, testScheduler);

            clientMock.Setup(x => x.GetVersion(It.IsAny<CancellationToken>())).Returns(Task.FromResult("10001"));
            clientMock.Setup(x => x.GetRuleset(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .Returns(Task.FromResult(new Dictionary<string, RuleDefinition> {{"test_rule", new RuleDefinition()}}));

            // Act
            testScheduler.AdvanceBy(TimeSpan.FromHours(1).Ticks);
            await Task.Delay(10);
            var result = await driver.GetAllRules();

            // Assert
            Assert.Equal("10001", driver.CurrentLabel);
            Assert.Equal("test_rule", result.Keys.Single());
            Assert.Equal(startTime.Hour + 1, driver.LastCheckTime.Hour);
        }

        [Fact]
        public async Task RulesUpdated_OnRulesChangeEventHasBeenFired()
        {
            // Arrange
            var testScheduler = new TestScheduler();
            testScheduler.Stop();

            var timesCalled = 0;

            var clientMock = new Mock<IRulesClient>();

            var settings = new MinioRulesDriverSettings {SampleIntervalInMs = 10};
            var driver = new MinioRulesDriver(clientMock.Object, settings, null, testScheduler);
            driver.OnRulesChange += rules => Interlocked.Increment(ref timesCalled);

            clientMock.Setup(x => x.GetRuleset(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .Returns(Task.FromResult(new Dictionary<string, RuleDefinition>()));

            // Act
            clientMock.Setup(x => x.GetVersion(It.IsAny<CancellationToken>())).Returns(Task.FromResult("10001"));
            testScheduler.AdvanceBy(TimeSpan.FromMilliseconds(11).Ticks);
            await Task.Delay(10);
            clientMock.Setup(x => x.GetVersion(It.IsAny<CancellationToken>())).Returns(Task.FromResult("10002"));
            testScheduler.AdvanceBy(TimeSpan.FromMilliseconds(11).Ticks);
            await Task.Delay(10);
            clientMock.Setup(x => x.GetVersion(It.IsAny<CancellationToken>())).Returns(Task.FromResult("10003"));
            testScheduler.AdvanceBy(TimeSpan.FromMilliseconds(11).Ticks);
            await Task.Delay(10);

            // Assert
            Assert.Equal("10003", driver.CurrentLabel);
            Assert.Equal(3, timesCalled);
        }
    }
}
