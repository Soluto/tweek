using System;
using System.Collections.Concurrent;
using System.Diagnostics;

namespace Tweek.Engine.Core.Utils
{
    public class Disposable: IDisposable {
        private readonly Action _cleanup;
        public Disposable(Action cleanup) => _cleanup = cleanup;
        public void Dispose() => _cleanup();
        public static IDisposable Create(Action cleanup) => new Disposable(cleanup);
    }

    public static class TraceHelpers
    {
        public static ConcurrentBag<string> c = new ConcurrentBag<string>(); 
        
        public static IDisposable TraceTime(string message)
        {
            var guid = Guid.NewGuid();
            c.Add($"{guid}::{message}::start");
            var sw = Stopwatch.StartNew();
            return  Disposable.Create(() =>
            {
                sw.Stop();
                c.Add($"{guid}::{message}::end::{sw.ElapsedMilliseconds}");
            });
        }
    }
}