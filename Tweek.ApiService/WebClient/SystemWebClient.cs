using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using Tweek.Drivers.Blob;

namespace Tweek.ApiService.WebClient
{
    public class SystemWebClient : IWebClient
    {
        private System.Net.WebClient mWebClient;

        public SystemWebClient()
        {
            mWebClient = new System.Net.WebClient();
        }

        public Encoding Encoding
        {
            get
            {
                return mWebClient.Encoding;
            }
            set
            {
                mWebClient.Encoding = value;
            }
        }

        public void Dispose()
        {
            mWebClient.Dispose();
        }

        public Task<string> DownloadStringTaskAsync(Uri address)
        {
            return mWebClient.DownloadStringTaskAsync(address);
        }
    }
}