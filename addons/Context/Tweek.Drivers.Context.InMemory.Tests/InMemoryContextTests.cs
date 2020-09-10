using System.Collections.Generic;
using FSharpUtils.Newtonsoft;
using Xunit;
using System;
using Tweek.Engine.DataTypes;

namespace Tweek.Drivers.Context.InMemory.Tests
{
    public class InMemoryContextTests
    {
        InMemoryContext inMemoryContext;

        public InMemoryContextTests()
        {
            inMemoryContext = new InMemoryContext();
        }

        [Fact]
        public async void AppendContext_NewIdentity()
        {
            var identity = new Identity("idType", "SomeIdentity");
            var newContext = new Dictionary<string, JsonValue>();
            newContext.Add("foo", JsonValue.NewString("bar"));

            await inMemoryContext.AppendContext(identity, newContext);

            var result = await inMemoryContext.GetContext(identity);
            Assert.Equal(newContext["foo"], result["foo"]);

            var creationDate = DateTimeOffset.Parse(result["@CreationDate"].AsString());
            var fiveMinutesAgo = DateTimeOffset.UtcNow.AddMinutes(-5);
            Assert.True(fiveMinutesAgo < creationDate);
        }

        [Fact]
        public async void AppendContext_AddToExistingIdentity()
        {
            var identity = new Identity("idType", "SomeIdentity");

            var newContext = new Dictionary<string, JsonValue>();
            newContext.Add("k1", JsonValue.NewString("v1"));
            await inMemoryContext.AppendContext(identity, newContext);

            newContext = new Dictionary<string, JsonValue>();
            newContext.Add("k2", JsonValue.NewString("v2"));
            await inMemoryContext.AppendContext(identity, newContext);

            var result = await inMemoryContext.GetContext(identity);
            Assert.Equal(JsonValue.NewString("v1"), result["k1"]);
            Assert.Equal(JsonValue.NewString("v2"), result["k2"]);
        }

        [Fact]
        public async void AppendContext_ReplaceItemInExistingIdentity()
        {
            var identity = new Identity("idType", "SomeIdentity");

            var newContext = new Dictionary<string, JsonValue>();
            newContext.Add("k1", JsonValue.NewString("v1"));
            newContext.Add("k2", JsonValue.NewString("v2"));
            await inMemoryContext.AppendContext(identity, newContext);

            newContext = new Dictionary<string, JsonValue>();
            newContext.Add("k1", JsonValue.NewString("v1-new"));
            await inMemoryContext.AppendContext(identity, newContext);

            var result = await inMemoryContext.GetContext(identity);
            Assert.Equal(JsonValue.NewString("v1-new"), result["k1"]);
            Assert.Equal(JsonValue.NewString("v2"), result["k2"]);
        }

        [Fact]
        public async void DeleteContext()
        {
            var identity = new Identity("idType", "SomeIdentity");

            var newContext = new Dictionary<string, JsonValue>();
            newContext.Add("k1", JsonValue.NewString("v1"));
            await inMemoryContext.AppendContext(identity, newContext);

            await inMemoryContext.DeleteContext(identity);

            var result = await inMemoryContext.GetContext(identity);
            Assert.False(result.ContainsKey("k1"));
        }

        [Fact]
        public async void RemoveFromContext()
        {
            var identity = new Identity("idType", "SomeIdentity");

            var newContext = new Dictionary<string, JsonValue>();
            newContext.Add("k1", JsonValue.NewString("v1"));
            newContext.Add("k2", JsonValue.NewString("v2"));
            await inMemoryContext.AppendContext(identity, newContext);

            await inMemoryContext.RemoveFromContext(identity, "k1");

            var result = await inMemoryContext.GetContext(identity);
            Assert.False(result.ContainsKey("k1"));
            Assert.Equal(JsonValue.NewString("v2"), result["k2"]);
        }
    }
}
