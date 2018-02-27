using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace Tweek.Publishing.Service.Storage
{
    public interface IObjectStorage
    {
        Task Get(string objectName, Action<Stream> reader, CancellationToken cancellationToken = default);

        Task Put(string objectName, Action<Stream> writer, string mimeType, CancellationToken cancellationToken = default);

        Task Delete(string objectName, CancellationToken cancellationToken = default);

        Task<bool> Exists(string objectName, CancellationToken cancellationToken = default);
    }
}