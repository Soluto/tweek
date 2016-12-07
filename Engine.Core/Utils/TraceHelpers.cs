using System;
using System.Diagnostics;
using System.Reactive.Disposables;

namespace Engine.Core.Utils
{
    public static class TraceHelpers
    {
        public static IDisposable TraceTime(string message)
        {
            var guid = Guid.NewGuid();
            Trace.TraceInformation($"{guid}::{message}::start");
            var sw = Stopwatch.StartNew();
            return Disposable.Create(() =>
            {
                sw.Stop();
                Trace.TraceInformation($"{guid}::{message}::end::{sw.ElapsedMilliseconds}");
            });
        }
    }
}