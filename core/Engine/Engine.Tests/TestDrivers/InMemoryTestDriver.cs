using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Engine.DataTypes;
using Engine.Drivers.Context;
using Engine.Drivers.Rules;
using Couchbase;
using Tweek.Drivers.CouchbaseDriver;
using System.IO;
using Couchbase.Core;
using FSharpUtils.Newtonsoft;
using LanguageExt;

namespace Engine.Tests.TestDrivers
{
    class InMemoryRulesTestDriver : IRulesDriver
    {
        private Dictionary<string, RuleDefinition> rules;

        public InMemoryRulesTestDriver(Dictionary<string, RuleDefinition> rules)
        {
            this.rules = rules;
        }

#pragma warning disable 0067
        public event Action<IDictionary<string, RuleDefinition>> OnRulesChange;
#pragma warning restore 0067

        public async Task<Dictionary<string, RuleDefinition>> GetAllRules()
        {
            return rules;
        }
    }

  class InMemoryContextDriver : IContextDriver
  {
    private Dictionary<Identity, Dictionary<string, JsonValue>> dictionary = new Dictionary<Identity, Dictionary<string, JsonValue>>();
    public InMemoryContextDriver(Dictionary<Identity, Dictionary<string, JsonValue>> dictionary){
        this.dictionary = dictionary;
    }
    public async Task AppendContext(Identity identity, Dictionary<string, JsonValue> context)
    {
        var currentContext = dictionary[identity];
        foreach (var item in context){
            currentContext[item.Key] = item.Value;
        }
    }

    public async Task<Dictionary<string, JsonValue>> GetContext(Identity identity)
    {
      return dictionary[identity];
    }

    public async Task RemoveFromContext(Identity identity, string key)
    {
        var currentContext = dictionary[identity];
        currentContext.Remove(key);
    }
  }

  class InMemoryTestDriver : ITestDriver
    {
        public Func<Task> cleanup = async ()=> {};
        private Dictionary<Identity, Dictionary<string, JsonValue>> dictionary = new Dictionary<Identity, Dictionary<string, JsonValue>>();

        public IContextDriver Context => new InMemoryContextDriver(dictionary);

        public InMemoryTestDriver()
        {
        }

        async Task InsertContextRows(Dictionary<Identity, Dictionary<string, JsonValue>> contexts)
        {
            cleanup = async () => contexts.Select(x => x.Key).Select(dictionary.Remove);
            foreach (var x in contexts){
                dictionary.Add(x.Key, x.Value);
            }
        }
       
        async Task Flush()
        {
            await cleanup();
        }

        public TestScope SetTestEnviornment(Dictionary<Identity, Dictionary<string, JsonValue>> contexts, string[] keys, Dictionary<string, RuleDefinition> rules)
        {
            return new TestScope(rules: new InMemoryRulesTestDriver(rules), context: Context, 
                init: () => InsertContextRows(contexts),
                dispose: Flush);
        }
    }
}
