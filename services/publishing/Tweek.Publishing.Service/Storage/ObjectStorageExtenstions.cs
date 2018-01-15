using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Tweek.Publishing.Service.Storage
{
  public static class ObjectStorageExtenstions {

        public static async Task<T> Get<T>(this IObjectStorage reader, string fileName, Func<Stream, CancellationToken, Task<T>> readerFn, CancellationToken cancellationToken = default(CancellationToken)){
            var value = default(T);
            Func<Stream, CancellationToken, Task> readerFnProxy =  async (Stream s, CancellationToken ct)=> {
                value = await readerFn(s, ct);
            };
            await reader.Get(fileName, readerFnProxy, cancellationToken);
            return value;
        }

        public static async Task<T> GetJSON<T>(this IObjectStorage reader, string fileName, CancellationToken cancellationToken = default(CancellationToken)){
            return await reader.Get(fileName, async (stream, ct)=> {
                using (var sr = new StreamReader(stream))
                using (var jsonReader = new JsonTextReader(sr))
                {
                    return (await JToken.ReadFromAsync(jsonReader, ct)).ToObject<T>();
                }
            }, cancellationToken);
        }

        public static async Task PutJSON<T>(this IObjectStorage reader, string fileName, T value, CancellationToken cancellationToken = default(CancellationToken)){
            await reader.Put(fileName, async (stream, ct)=> {
                using (var sr = new StreamWriter(stream))
                using (var jsonWriter = new JsonTextWriter(sr))
                {
                    await JToken.FromObject(value).WriteToAsync(jsonWriter, ct);
                }
            }, cancellationToken);
        }
    }
}