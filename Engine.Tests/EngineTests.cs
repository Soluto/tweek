using System.Collections.Generic;
using System.Threading.Tasks;
using Engine.Context;
using Engine.Core;
using Engine.Core.Rules;
using Engine.DataTypes;
using Engine.Keys;
using Engine.Rules;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace Engine.Tests
{
    

    [TestClass]
    public class EngineTests
    {
        [TestMethod]
        public async Task Calculate()
        {
            var context = ContextByIdentityCreation.Convert(new Dictionary<string,string>(){{"AgentVersion", "10"}});
            GetContextByIdentity contextByIdentity = async (identity) => context;
            PathTraversal traversal = path => new HashSet<ConfigurationPath> {"abc/somepath"};
            RulesRepository rulesRepository = path => new List<IRule>()
            {
                new SingleVariantRule()
                {
                    Matcher = x => true,
                    Value = new ConfigurationValue("SomeValue"),
                }
            };

            var engine = new Tweek(contextByIdentity, traversal, rulesRepository);

            var val = await engine.Calculate("abc", new HashSet<Identity>{new Identity("device", "1")});
            Assert.AreEqual(val["somepath"].Value, "SomeValue");

        }
    }
}
