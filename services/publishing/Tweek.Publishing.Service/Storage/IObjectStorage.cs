using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace Tweek.Publishing.Service.Storage
{
  public interface IObjectStorage {
        Task Get(string objectName, Action<Stream> reader, CancellationToken cancellationToken = default(CancellationToken));
        Task Put(string objectName, Action<Stream> writer, string mimeType, CancellationToken cancellationToken = default(CancellationToken));
        Task Delete(string objectName, CancellationToken cancellationToken = default(CancellationToken));
    }
}