using System.Collections.Generic;
using System.Threading.Tasks;
using FSharpUtils.Newtonsoft;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Tweek.ApiService.MultiContext;
using Tweek.Engine.DataTypes;
using Tweek.Engine.Drivers.Context;
using Xunit;

namespace Tweek.ApiService.Tests
{
    public class MultiContextAddonTests
    {
        private MultiContextAddon _addon;
        private IConfigurationRoot _configurationRoot;
        private IServiceCollection _serviceCollection;

        private void Setup()
        {
            _addon = new MultiContextAddon();
            _configurationRoot = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string>
            {
                {"Addons:InMemoryContext:ClassName", "Tweek.ApiService.Tests.InMemoryContextServiceAddon"},
                {"Addons:InMemoryContext:AssemblyName", "Tweek.ApiService.Tests"},

                {"Addons:MultiContext:ClassName", "Tweek.ApiService.MultiServiceAddon"},
                {"Addons:MultiContext:AssemblyName", "Tweek.ApiService"},

                {"MultiContext:Readers", "InMemoryContext"},
                {"MultiContext:Writers", "InMemoryContext"},
            }).Build();
            _serviceCollection = new ServiceCollection();
        }

        [Fact]
        public async Task RegistrationWorksAsExpected()
        {
            var identity = new Identity("some_identity", "1");
            var expectedValue = new Dictionary<string, JsonValue>
            {
                {"id", JsonValue.NewString("1")},
                {"key", JsonValue.NewString("value")},
            };
            
            Setup();
            _addon.Configure(_serviceCollection, _configurationRoot);
            var driver = _serviceCollection.BuildServiceProvider().GetService(typeof(IContextDriver));

            Assert.IsType<MultiContextDriver>(driver);

            var multiDriver = (IContextDriver) driver;
            await multiDriver.AppendContext(identity, expectedValue);
            var result = await multiDriver.GetContext(identity);

            Assert.Equal(expectedValue, result);
        }
    }
}