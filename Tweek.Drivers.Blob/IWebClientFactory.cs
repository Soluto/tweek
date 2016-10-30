using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Tweek.Drivers.Blob
{
    public interface IWebClientFactory
    {
        IWebClient Create();
    }
}
