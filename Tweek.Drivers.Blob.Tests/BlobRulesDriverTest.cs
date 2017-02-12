using System;
using System.Reactive.Concurrency;
using Moq;
using System.Threading.Tasks;
using System.Text;
using Xunit;

namespace Tweek.Drivers.Blob.Tests
{
    public class BlobRulesDriverTest
    {
        private Mock<IWebClient> mWebClientMock;
        private Mock<IWebClientFactory> mWebClientFactoryMock;

        public BlobRulesDriverTest()
        {
            mWebClientMock = new Mock<IWebClient>();
            mWebClientFactoryMock = new Mock<IWebClientFactory>();
            mWebClientFactoryMock.Setup(x => x.Create()).Returns(mWebClientMock.Object);
        }

        [Fact]
        public void Ctor_ShouldUseUTF8Encoding()
        {
            // Arrange
            mWebClientMock.Setup(x => x.DownloadStringTaskAsync(It.IsAny<Uri>()))
                .Returns(Task.FromResult("test result"));

            mWebClientFactoryMock.Setup(x => x.Create()).Returns(mWebClientMock.Object);
            
            // Act
            var blobRulesDriver =
                new BlobRulesDriver(new Mock<Uri>("https://github.com").Object, mWebClientFactoryMock.Object,Scheduler.Immediate);


            // Assert
            mWebClientMock.VerifySet(x => x.Encoding = Encoding.UTF8);
        }
    }
}
