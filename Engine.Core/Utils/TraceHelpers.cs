using System;
using System.Collections.Concurrent;
using System.Diagnostics;
using System.Reactive.Disposables;

namespace Engine.Core.Utils
{
    public static class TraceHelpers
    {
        public static ConcurrentBag<string> c = new ConcurrentBag<string>(); 
        public static void Flush()
        {
            foreach (var item in c)
            {
                //Trace.TraceInformation(item);
            }
        }
        public static IDisposable TraceTime(string message)
        {
            var guid = Guid.NewGuid();
            c.Add($"{guid}::{message}::start");
            var sw = Stopwatch.StartNew();
            return Disposable.Create(() =>
            {
                sw.Stop();
                c.Add($"{guid}::{message}::end::{sw.ElapsedMilliseconds}");
            });
        }
    }
}