using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FakeItEasy;
using FSharpUtils.Newtonsoft;
using Tweek.ApiService.MultiContext;
using Tweek.Engine.DataTypes;
using Tweek.Engine.Drivers.Context;
using Xunit;

namespace Tweek.ApiService.UnitTests
{
    public class MultiDriverTest
    {
        private MultiDriver multiDriver;
        private IContextDriver someFakeDriver;
        private IContextDriver someOtherFakeDriver;
        private readonly Identity fakeIdentity = new Identity("some_type", "1");

        private void Setup()
        {
            someFakeDriver = A.Fake<IContextDriver>();
            someOtherFakeDriver = A.Fake<IContextDriver>();
            multiDriver = new MultiDriver(new IContextDriver[]
                {
                    someFakeDriver,
                    someOtherFakeDriver
                },
                new IContextDriver[]
                {
                    someFakeDriver,
                    someOtherFakeDriver
                }
            );
        }
        
        [Fact]
        public void GivenMockReadersAndWriters_GetContextCalled_ReturnsExpectedResult()
        {
            Setup();
            var expectedResult = Task.FromResult(new Dictionary<string, JsonValue>
            {
                {"id", JsonValue.NewString("1")},
                {"some_key", JsonValue.NewString("some_value")},
            });

            A.CallTo(() => someFakeDriver.GetContext(A<Identity>.That.IsEqualTo(fakeIdentity))).Throws<Exception>();
            A.CallTo(() => someOtherFakeDriver.GetContext(A<Identity>.That.IsEqualTo(fakeIdentity))).Returns(expectedResult);
            
            Assert.Equal(multiDriver.GetContext(fakeIdentity).Result, expectedResult.Result);

            A.CallTo(() => someFakeDriver.GetContext(A<Identity>.That.IsEqualTo(fakeIdentity))).MustHaveHappened();

        }
        
        [Fact]
        public void GivenMockReadersAndWriters_AppendContextCalled_DoesntThrow()
        {
            Setup();
            var context = new Dictionary<string, JsonValue>
            {
                {"id", JsonValue.NewString("1")},
                {"some_key", JsonValue.NewString("some_value")},
            };
            
            multiDriver.AppendContext(fakeIdentity, context).Wait();
            A.CallTo(() => someFakeDriver.AppendContext(A<Identity>.That.IsEqualTo(fakeIdentity), A<Dictionary<string, JsonValue>>.That.IsEqualTo(context))).MustHaveHappened();
            A.CallTo(() => someOtherFakeDriver.AppendContext(A<Identity>.That.IsEqualTo(fakeIdentity), A<Dictionary<string, JsonValue>>.That.IsEqualTo(context))).MustHaveHappened();
        }
        
        [Fact]
        public void GivenMockReadersAndWriters_RemoveFromContextCalled_DoesntThrow()
        {
            Setup();
            multiDriver.RemoveFromContext(fakeIdentity, "some_key").Wait();
            A.CallTo(() => someFakeDriver.RemoveFromContext(A<Identity>.That.IsEqualTo(fakeIdentity), A<string>.That.IsEqualTo("some_key"))).MustHaveHappened();
            A.CallTo(() => someOtherFakeDriver.RemoveFromContext(A<Identity>.That.IsEqualTo(fakeIdentity), A<string>.That.IsEqualTo("some_key"))).MustHaveHappened();
        }
        
    }
}