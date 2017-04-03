using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Net.Http;
using Tweek.Drivers.Blob;

namespace Tweek.Drivers.Blob.WebClient
{
    public class SystemWebClient : IWebClient
    {
        private HttpClient _client;

        public SystemWebClient()
        {

            _client = new HttpClient();
        }

        public Encoding Encoding { get; set; } = Encoding.UTF8;

        public void Dispose()
        {
            _client.Dispose();
        }

        public async Task<string> DownloadStringTaskAsync(Uri address)
        {
            return Encoding.GetString(await _client.GetByteArrayAsync(address));
        }
    }
}