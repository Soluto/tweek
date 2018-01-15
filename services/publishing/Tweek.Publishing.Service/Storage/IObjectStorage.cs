using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace Tweek.Publishing.Service.Storage
{
  public interface IObjectStorage {
        Task Get(string objectName, Func<Stream, CancellationToken, Task> reader, CancellationToken cancellationToken = default(CancellationToken));
        Task Put(string objectName, Func<Stream, CancellationToken, Task> writer, CancellationToken cancellationToken = default(CancellationToken));
    }
}