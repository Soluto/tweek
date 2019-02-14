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
        public async Task GivenMockReadersAndWriters_GetContextCalled_ReturnsExpectedResult()
        {
            Setup();
            var expectedResult = new Dictionary<string, JsonValue>
            {
                {"id", JsonValue.NewString("1")},
                {"some_key", JsonValue.NewString("some_value")},
            };

            A.CallTo(() => _someFakeDriver.GetContext(A<Identity>.That.IsEqualTo(_fakeIdentity)))
                .ThrowsAsync(new Exception());
            A.CallTo(() => _someOtherFakeDriver.GetContext(A<Identity>.That.IsEqualTo(_fakeIdentity))).Returns(expectedResult);
            
            Assert.Equal(await _multiContextDriver.GetContext(_fakeIdentity), expectedResult);

            A.CallTo(() => _someFakeDriver.GetContext(A<Identity>.That.IsEqualTo(_fakeIdentity))).MustHaveHappened();

        }
        
        [Fact]
        public async Task GivenMockReadersAndWriters_AppendContextCalled_DoesntThrow()
        {
            Setup();
            var context = new Dictionary<string, JsonValue>
            {
                {"id", JsonValue.NewString("1")},
                {"some_key", JsonValue.NewString("some_value")},
            };
            
            await _multiContextDriver.AppendContext(_fakeIdentity, context);
            A.CallTo(() => _someFakeDriver.AppendContext(A<Identity>.That.IsEqualTo(_fakeIdentity), A<Dictionary<string, JsonValue>>.That.IsEqualTo(context))).MustHaveHappened();
            A.CallTo(() => _someOtherFakeDriver.AppendContext(A<Identity>.That.IsEqualTo(_fakeIdentity), A<Dictionary<string, JsonValue>>.That.IsEqualTo(context))).MustHaveHappened();
        }
        
        [Fact]
        public async Task GivenMockReadersAndWriters_AppendContextCalled_ThrowsWhenOneOfThemThrows()
        {
            Setup();
            var context = new Dictionary<string, JsonValue>
            {
                {"id", JsonValue.NewString("1")},
                {"some_key", JsonValue.NewString("some_value")},
            };

            A.CallTo(() => _someOtherFakeDriver.AppendContext(A<Identity>.That.IsEqualTo(_fakeIdentity),
                A<Dictionary<string, JsonValue>>.That.IsEqualTo(context))).Throws<Exception>();

            await Assert.ThrowsAsync<Exception>(async () => await _multiContextDriver.AppendContext(_fakeIdentity, context));

            A.CallTo(() => _someFakeDriver.AppendContext(A<Identity>.That.IsEqualTo(_fakeIdentity), A<Dictionary<string, JsonValue>>.That.IsEqualTo(context))).MustHaveHappened();
            A.CallTo(() => _someOtherFakeDriver.AppendContext(A<Identity>.That.IsEqualTo(_fakeIdentity), A<Dictionary<string, JsonValue>>.That.IsEqualTo(context))).MustHaveHappened();
        }
        
        [Fact]
        public async Task GivenMockReadersAndWriters_RemoveFromContextCalled_DoesntThrow()
        {
            Setup();
            await _multiContextDriver.RemoveFromContext(_fakeIdentity, "some_key");
            A.CallTo(() => _someFakeDriver.RemoveFromContext(A<Identity>.That.IsEqualTo(_fakeIdentity), A<string>.That.IsEqualTo("some_key"))).MustHaveHappened();
            A.CallTo(() => _someOtherFakeDriver.RemoveFromContext(A<Identity>.That.IsEqualTo(_fakeIdentity), A<string>.That.IsEqualTo("some_key"))).MustHaveHappened();
        }
        
        [Fact]
        public async Task GivenMockReadersAndWriters_DeleteContextCalled_DoesntThrow()
        {
            Setup();
            await _multiContextDriver.DeleteContext(_fakeIdentity);
            A.CallTo(() => _someFakeDriver.DeleteContext(A<Identity>.That.IsEqualTo(_fakeIdentity))).MustHaveHappened();
            A.CallTo(() => _someOtherFakeDriver.DeleteContext(A<Identity>.That.IsEqualTo(_fakeIdentity))).MustHaveHappened();
        }        
    }
}