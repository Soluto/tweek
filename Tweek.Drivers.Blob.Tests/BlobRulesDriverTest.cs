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
        private Mock<Uri> mUriMock;
        private Mock<IWebClient> mWebClientMock;
        private Mock<IWebClientFactory> mWebClientFactoryMock;

        [TestInitialize]
        public void TestInitialize()
        {
            mUriMock = new Mock<Uri>("https://github.com");
            mWebClientMock = new Mock<IWebClient>();
            mWebClientFactoryMock = new Mock<IWebClientFactory>();
            mWebClientFactoryMock.Setup(x => x.Create()).Returns(mWebClientMock.Object);
        }

        [TestMethod]
        public void Ctor_ShouldUseUTF8Encoding()
        {
            // Arrange
            mWebClientMock.Setup(x => x.DownloadStringTaskAsync(It.IsAny<Uri>()))
                .Returns(Task.FromResult("test result"));

            mWebClientFactoryMock.Setup(x => x.Create()).Returns(mWebClientMock.Object);

            // Act
            var blobRulesDriver =
                new BlobRulesDriver(new Mock<Uri>("https://github.com").Object, mWebClientFactoryMock.Object);

            // Assert
            mWebClientMock.VerifySet(x => x.Encoding = Encoding.UTF8);
        }

        [TestMethod]
        public void Ctor_ShouldCallWebClientWithCorrectUrl()
        {
            // Arrange
            mWebClientMock.Setup(x => x.DownloadStringTaskAsync(It.Is<Uri>(_uri => _uri == mUriMock.Object)))
                .Returns(Task.FromResult("test result"));

            // Act
            var blobRulesDriver = new BlobRulesDriver(mUriMock.Object, mWebClientFactoryMock.Object);
        }
    }
}
