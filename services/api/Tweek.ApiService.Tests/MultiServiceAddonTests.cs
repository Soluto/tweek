using System;
using System.Collections.Generic;
using System.ComponentModel.Design;
using System.Threading.Tasks;
using FSharpUtils.Newtonsoft;
using Microsoft.AspNetCore.Builder.Internal;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Tweek.ApiService.MultiContext;
using Tweek.Drivers.Context.Multi;
using Tweek.Engine.DataTypes;
using Tweek.Engine.Drivers.Context;
using Xunit;

namespace Tweek.ApiService.Tests
{
    public class MultiServiceAddonTests
    {
        private MultiServiceAddon _addon;
        private IConfigurationRoot _configurationRoot;
        private IServiceCollection _serviceCollection;

        private readonly Dictionary<string, JsonValue> _expectedValue = new Dictionary<string, JsonValue>
        {
            {"id", JsonValue.NewString("1")},
            {"key", JsonValue.NewString("value")},
        };

        private readonly Identity _identity = new Identity("some_identity", "1");

        public void Setup()
        {
            _addon = new MultiServiceAddon();
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
            Setup();
            _addon.Configure(_serviceCollection, _configurationRoot);
            var driver = _serviceCollection.BuildServiceProvider().GetService(typeof(IContextDriver));
            
            Assert.IsType<MultiDriver>(driver);
            
            var multiDriver = (IContextDriver) driver;
            await multiDriver.AppendContext(_identity, _expectedValue);
            var result = await multiDriver.GetContext(_identity);
            
            Assert.Equal(_expectedValue, result);
        }
    }
}