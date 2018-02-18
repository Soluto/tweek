using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using static LanguageExt.Prelude;

namespace Tweek.Publishing.Service.Storage
{
    public static class ObjectStorageExtenstions
    {
        public static async Task<T> Get<T>(this IObjectStorage reader, string fileName, Func<Stream, T> readerFn, CancellationToken cancellationToken = default)
        {
            var tsc = new TaskCompletionSource<T>();
            var readerFnProxy = act((Stream s) => { tsc.SetResult(readerFn(s)); });
            await reader.Get(fileName, readerFnProxy, cancellationToken);
            return await tsc.Task;
        }

        public static async Task<T> GetJSON<T>(this IObjectStorage reader, string fileName, CancellationToken cancellationToken = default)
        {
            return await reader.Get(fileName, stream =>
            {
                using (var sr = new StreamReader(stream))
                using (var jsonReader = new JsonTextReader(sr))
                {
                    return JToken.Load(jsonReader).ToObject<T>();
                }
            }, cancellationToken);
        }

        public static async Task PutJSON<T>(this IObjectStorage reader, string fileName, T value, CancellationToken cancellationToken = default)
        {
            await reader.Put(fileName, stream =>
            {
                using (var sr = new StreamWriter(stream))
                using (var jsonWriter = new JsonTextWriter(sr))
                {
                    JToken.FromObject(value).WriteTo(jsonWriter);
                }
            }, "application/json", cancellationToken);
        }

        public static async Task PutStream(this IObjectStorage reader, string fileName, Stream sourceStream, string mimeType, CancellationToken cancellationToken = default)
        {
            await reader.Put(fileName, stream =>
            {
                sourceStream.CopyTo(stream);
            }, mimeType, cancellationToken);
        
        }
    }
}