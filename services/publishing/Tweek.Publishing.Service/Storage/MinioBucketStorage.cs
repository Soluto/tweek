using System;
using System.IO;
using System.Reactive;
using System.Threading;
using System.Threading.Tasks;
using Minio;

namespace Tweek.Publishing.Service.Storage
{
  public class MinioBucketStorage : IObjectStorage
  {
    private readonly MinioClient _client;
    private readonly string _bucketName;

    public MinioBucketStorage(MinioClient client, string bucketName)
    {
      _client = client;
      _bucketName = bucketName;
    }
    public async Task Get(string objectName, Func<Stream, CancellationToken, Task> reader, CancellationToken cancellationToken = default(CancellationToken))
    {
      var tsc = new TaskCompletionSource<Unit>();
      await _client.GetObjectAsync(_bucketName, objectName, async (s)=> { 
          try
          {
            if (cancellationToken.IsCancellationRequested){
                tsc.SetCanceled();
                return;
            }
            await reader(s, cancellationToken);
            if (cancellationToken.IsCancellationRequested){
                tsc.SetCanceled();
                return;
            }
            tsc.SetResult(System.Reactive.Unit.Default);
          }
          catch (Exception ex){
            tsc.SetException(ex);
          }
      }, cancellationToken);
      await tsc.Task;
    }

    public async Task Put(string objectName, Func<Stream, CancellationToken, Task> writer, CancellationToken cancellationToken = default(CancellationToken))
    {
       var stream = new MemoryStream();
       await writer(stream, cancellationToken);
       if (cancellationToken.IsCancellationRequested) return;
       var size = stream.Position;
       stream.Position = 0;
       await _client.PutObjectAsync(_bucketName, objectName, stream, size, cancellationToken: cancellationToken);
    }
  }
}