using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System.Threading.Tasks;
using System.Text;

namespace Tweek.Drivers.Blob.Tests
{
    [TestClass]
    public class BlobRulesDriverTest
    {
        private Mock<IWebClient> mWebClientMock;
        private Mock<IWebClientFactory> mWebClientFactoryMock;

        [TestInitialize]
        public void TestInitialize()
        {
            mWebClientMock = new Mock<IWebClient>();
            mWebClientFactoryMock = new Mock<IWebClientFactory>();
            mWebClientFactoryMock.Setup(x => x.Create()).Returns(mWebClientMock.Object);
        }

        [TestMethod]
        public async Task Ctor_ShouldUseUTF8Encoding()
        {
            // Arrange
            mWebClientMock.Setup(x => x.DownloadStringTaskAsync(It.IsAny<Uri>()))
                .Returns(Task.FromResult("test result"));

            mWebClientFactoryMock.Setup(x => x.Create()).Returns(mWebClientMock.Object);

            // Act
            var blobRulesDriver =
                new BlobRulesDriver(new Mock<Uri>("https://github.com").Object, mWebClientFactoryMock.Object);

            await Task.Yield();

            // Assert
            mWebClientMock.VerifySet(x => x.Encoding = Encoding.UTF8);
        }
    }
}
