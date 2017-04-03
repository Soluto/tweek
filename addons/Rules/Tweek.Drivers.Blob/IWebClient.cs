using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Tweek.Drivers.Blob
{
    public interface IWebClient : IDisposable
    {
        Encoding Encoding { get; set; }
        Task<string> DownloadStringTaskAsync(Uri address);
    }
}
