using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Web;

namespace Tweek.ApiService.Utils
{
    public static class NancyHelpers
    {
        public static Func<dynamic, CancellationToken, Task<dynamic>> AsyncTimeout(
            int timeout,
            Func<dynamic, CancellationToken, Task<dynamic>> fn) =>
                async (context, token) =>
                {
                    var newToken = new CancellationTokenSource();
                    token.Register(() => newToken.Cancel());
                    var delay = Task.Delay(timeout, newToken.Token);
                    try
                    {
                        var result = await Task.WhenAny(delay, fn(context, newToken.Token));
                        if (token.IsCancellationRequested) throw new TaskCanceledException();
                        if (result == delay) throw new TimeoutException();
                        return await result;
                    }
                    finally
                    {
                        newToken.Cancel();
                    }
                };
    }
}