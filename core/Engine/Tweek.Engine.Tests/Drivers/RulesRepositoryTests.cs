using System;
using System.Collections.Generic;
using System.Linq;
using System.Reactive.Subjects;
using System.Threading;
using System.Threading.Tasks;
using Engine.Drivers.Rules;
using Moq;
using Xunit;

namespace Engine.Tests.Drivers
{
    public class RulesRepositoryTests
    {
        [Fact]
        public async Task WhenGivenEmptyRules_ShouldReturnExpectedVersionAndEmptyRules()
        {
            // Arrange
            var versions = new ReplaySubject<string>(1);
            versions.OnNext("10001");

            var clientMock = new Mock<IRulesDriver>();
            clientMock.Setup(x => x.OnVersion()).Returns(versions);
            clientMock.Setup(x => x.GetRuleset(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .Returns(Task.FromResult(new Dictionary<string, RuleDefinition>()));

            var driver = new RulesRepository(clientMock.Object, TimeSpan.Zero);

            // Act
            var result = await driver.GetAllRules();

            // Assert
            Assert.Equal("10001", driver.CurrentLabel);
            Assert.Empty(result);
        }

        [Fact]
        public async Task WhenVersionIsNewer_ShouldUpdateTheRules()
        {
            // Arrange
            var versions = new ReplaySubject<string>(1);

            var clientMock = new Mock<IRulesDriver>();
            clientMock.Setup(x => x.OnVersion()).Returns(versions);

            var driver = new RulesRepository(clientMock.Object, TimeSpan.Zero);

            // Act/Assert
            clientMock.Setup(x => x.GetRuleset(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .Returns(Task.FromResult(
                    new Dictionary<string, RuleDefinition> { { "test_rule1", new RuleDefinition() } }));
            versions.OnNext("10001");

            var result = await driver.GetAllRules();
            Assert.Equal("10001", driver.CurrentLabel);
            Assert.Equal("test_rule1", result.Keys.Single());

            clientMock.Setup(x => x.GetRuleset(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .Returns(Task.FromResult(
                    new Dictionary<string, RuleDefinition> { { "test_rule2", new RuleDefinition() } }));
            versions.OnNext("10002");
            await Task.Delay(10);

            result = await driver.GetAllRules();
            Assert.Equal("10002", driver.CurrentLabel);
            Assert.Equal("test_rule2", result.Keys.Single());
        }

        [Fact]
        public async Task RulesUpdated_OnRulesChangeEventHasBeenFired()
        {
            // Arrange
            var timesCalled = 0;

            var versions = new ReplaySubject<string>(1);

            var clientMock = new Mock<IRulesDriver>();
            clientMock.Setup(x => x.OnVersion()).Returns(versions);
            clientMock.Setup(x => x.GetRuleset(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .Returns(Task.FromResult(new Dictionary<string, RuleDefinition>()));

            var driver = new RulesRepository(clientMock.Object, TimeSpan.Zero);
            driver.OnRulesChange += rules => Interlocked.Increment(ref timesCalled);

            // Act
            versions.OnNext("10001");
            await Task.Delay(10);

            versions.OnNext("10002");
            await Task.Delay(10);

            versions.OnNext("10003");
            await Task.Delay(10);

            // Assert
            Assert.Equal("10003", driver.CurrentLabel);
            Assert.Equal(3, timesCalled);
        }

        [Fact]
        public async Task ExceptionThrown_ShouldRecoverFromException()
        {
            var versions = new ReplaySubject<string>(1);

            var clientMock = new Mock<IRulesDriver>();
            clientMock.Setup(x => x.OnVersion()).Returns(versions);
            clientMock.Setup(x => x.GetRuleset(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .Returns(Task.FromResult(new Dictionary<string, RuleDefinition>()));

            var driver = new RulesRepository(clientMock.Object, TimeSpan.Zero);

            // Act
            versions.OnNext("10001");
            await Task.Delay(10);

            var newVersions = new ReplaySubject<string>(1);
            newVersions.OnNext("10002");
            clientMock.Setup(x => x.OnVersion()).Returns(newVersions);

            versions.OnError(new Exception());

            await Task.Delay(20);

            // Assert
            Assert.Equal("10002", driver.CurrentLabel);
        }
    }
}
