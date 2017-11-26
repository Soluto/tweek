using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reactive.Linq;
using System.Reactive.Subjects;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Reactive.Testing;
using Tweek.Engine.Drivers.Rules;
using Xunit;

namespace Tweek.Engine.Tests.Drivers
{
    public class RulesRepositoryTests
    {
        [Fact]
        public async Task WhenGivenEmptyRules_ShouldReturnExpectedVersionAndEmptyRules()
        {
            // Arrange
            var versions = new ReplaySubject<string>(1);
            versions.OnNext("10001");
            var versionsMock = new Mock<IRulesetVersionProvider>();
            versionsMock.Setup(x => x.OnVersion()).Returns(versions);

            var driverMock = new Mock<IRulesDriver>();
            driverMock.Setup(x => x.GetRuleset(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .Returns(Task.FromResult(new Dictionary<string, RuleDefinition>()));

            var repository = new RulesRepository(driverMock.Object, versionsMock.Object, TimeSpan.Zero, TimeSpan.FromMinutes(1));

            // Act
            var result = await repository.GetAllRules();

            // Assert
            Assert.Equal("10001", repository.CurrentLabel);
            Assert.Empty(result);
        }

        [Fact]
        public async Task WhenVersionIsNewer_ShouldUpdateTheRules()
        {
            // Arrange
            var versions = new ReplaySubject<string>(1);
            var versionsMock = new Mock<IRulesetVersionProvider>();
            versionsMock.Setup(x => x.OnVersion()).Returns(versions);

            var driverMock = new Mock<IRulesDriver>();

            var repository = new RulesRepository(driverMock.Object, versionsMock.Object, TimeSpan.Zero, TimeSpan.FromMinutes(1));

            // Act/Assert
            driverMock.Setup(x => x.GetRuleset(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .Returns(Task.FromResult(
                    new Dictionary<string, RuleDefinition> { { "test_rule1", new RuleDefinition() } }));
            versions.OnNext("10001");

            var result = await repository.GetAllRules();
            Assert.Equal("10001", repository.CurrentLabel);
            Assert.Equal("test_rule1", result.Keys.Single());

            driverMock.Setup(x => x.GetRuleset(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .Returns(Task.FromResult(
                    new Dictionary<string, RuleDefinition> { { "test_rule2", new RuleDefinition() } }));
            versions.OnNext("10002");
            await Task.Delay(10);

            result = await repository.GetAllRules();
            Assert.Equal("10002", repository.CurrentLabel);
            Assert.Equal("test_rule2", result.Keys.Single());
        }

        [Fact]
        public async Task RulesUpdated_OnRulesChangeEventHasBeenFired()
        {
            // Arrange
            var timesCalled = 0;

            var versions = new ReplaySubject<string>(1);
            var versionsMock = new Mock<IRulesetVersionProvider>();
            versionsMock.Setup(x => x.OnVersion()).Returns(versions);

            var driverMock = new Mock<IRulesDriver>();
            driverMock.Setup(x => x.GetRuleset(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .Returns(Task.FromResult(new Dictionary<string, RuleDefinition>()));

            var repository = new RulesRepository(driverMock.Object, versionsMock.Object, TimeSpan.Zero, TimeSpan.FromMinutes(1));
            repository.OnRulesChange += rules => Interlocked.Increment(ref timesCalled);

            // Act
            versions.OnNext("10001");
            await Task.Delay(10);

            versions.OnNext("10002");
            await Task.Delay(10);

            versions.OnNext("10003");
            await Task.Delay(10);

            // Assert
            Assert.Equal("10003", repository.CurrentLabel);
            Assert.Equal(3, timesCalled);
        }

        [Fact]
        public async Task ExceptionThrown_ShouldRecoverFromException()
        {
            var versions = new ReplaySubject<string>(1);
            var versionsMock = new Mock<IRulesetVersionProvider>();
            versionsMock.Setup(x => x.OnVersion()).Returns(versions);

            var driverMock = new Mock<IRulesDriver>();
            driverMock.Setup(x => x.GetRuleset(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .Returns(Task.FromResult(new Dictionary<string, RuleDefinition>()));

            var repository = new RulesRepository(driverMock.Object, versionsMock.Object, TimeSpan.Zero, TimeSpan.FromMinutes(1));

            // Act
            versions.OnNext("10001");
            await Task.Delay(10);

            var newVersions = new ReplaySubject<string>(1);
            newVersions.OnNext("10002");
            versionsMock.Setup(x => x.OnVersion()).Returns(newVersions);

            versions.OnError(new Exception());

            await Task.Delay(20);

            // Assert
            Assert.Equal("10002", repository.CurrentLabel);
        }

        [Fact]
        public async Task VersionsTimeout_ResubscribeToVersions()
        {
            // Arrange
            var scheduler = new TestScheduler();

            var versionsMock = new Mock<IRulesetVersionProvider>();
            versionsMock.Setup(x => x.OnVersion()).Returns(Observable.Never<string>());

            var driverMock = new Mock<IRulesDriver>();
            driverMock.Setup(x => x.GetRuleset(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .Returns(Task.FromResult(new Dictionary<string, RuleDefinition>()));

            var repository = new RulesRepository(driverMock.Object, versionsMock.Object, TimeSpan.Zero, TimeSpan.FromMinutes(10), scheduler: scheduler);

            // Act
            await Task.Delay(10);

            var versions = new ReplaySubject<string>(1);
            versions.OnNext("10001");
            versionsMock.Setup(x => x.OnVersion()).Returns(versions);

            scheduler.AdvanceBy(TimeSpan.FromMinutes(11).Ticks);

            await Task.Delay(10);

            // Assert
            Assert.Equal("10001", repository.CurrentLabel);
        }
    }
}
