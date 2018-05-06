using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FakeItEasy;
using FSharpUtils.Newtonsoft;
using Tweek.ApiService.MultiContext;
using Tweek.Engine.DataTypes;
using Tweek.Engine.Drivers.Context;
using Xunit;

namespace Tweek.ApiService.Tests
{
    public class MultiContextDriverTest
    {
        private MultiContextDriver _multiContextDriver;
        private IContextDriver _someFakeDriver;
        private IContextDriver _someOtherFakeDriver;
        private readonly Identity _fakeIdentity = new Identity("some_type", "1");

        private void Setup()
        {
            _someFakeDriver = A.Fake<IContextDriver>();
            _someOtherFakeDriver = A.Fake<IContextDriver>();
            _multiContextDriver = new MultiContextDriver(new IContextDriver[]
                {
                    _someFakeDriver,
                    _someOtherFakeDriver
                },
                new IContextDriver[]
                {
                    _someFakeDriver,
                    _someOtherFakeDriver
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

            A.CallTo(() => _someFakeDriver.GetContext(A<Identity>.That.IsEqualTo(_fakeIdentity))).Throws<Exception>();
            A.CallTo(() => _someOtherFakeDriver.GetContext(A<Identity>.That.IsEqualTo(_fakeIdentity))).Returns(expectedResult);
            
            Assert.Equal(_multiContextDriver.GetContext(_fakeIdentity).Result, expectedResult.Result);

            A.CallTo(() => _someFakeDriver.GetContext(A<Identity>.That.IsEqualTo(_fakeIdentity))).MustHaveHappened();

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
            
            _multiContextDriver.AppendContext(_fakeIdentity, context).Wait();
            A.CallTo(() => _someFakeDriver.AppendContext(A<Identity>.That.IsEqualTo(_fakeIdentity), A<Dictionary<string, JsonValue>>.That.IsEqualTo(context))).MustHaveHappened();
            A.CallTo(() => _someOtherFakeDriver.AppendContext(A<Identity>.That.IsEqualTo(_fakeIdentity), A<Dictionary<string, JsonValue>>.That.IsEqualTo(context))).MustHaveHappened();
        }
        
        [Fact]
        public void GivenMockReadersAndWriters_RemoveFromContextCalled_DoesntThrow()
        {
            Setup();
            _multiContextDriver.RemoveFromContext(_fakeIdentity, "some_key").Wait();
            A.CallTo(() => _someFakeDriver.RemoveFromContext(A<Identity>.That.IsEqualTo(_fakeIdentity), A<string>.That.IsEqualTo("some_key"))).MustHaveHappened();
            A.CallTo(() => _someOtherFakeDriver.RemoveFromContext(A<Identity>.That.IsEqualTo(_fakeIdentity), A<string>.That.IsEqualTo("some_key"))).MustHaveHappened();
        }
        
    }
}