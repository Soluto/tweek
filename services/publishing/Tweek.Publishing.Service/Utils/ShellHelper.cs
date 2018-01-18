using System;
using System.Diagnostics;
using System.IO;
using System.Reactive;
using System.Reactive.Disposables;
using System.Reactive.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Linq;
using System.IO.Compression;
using System.Runtime.CompilerServices;
using System.Collections.Generic;
using static LanguageExt.Prelude;
using Tweek.Publishing.Service.Utils;

namespace Tweek.Publishing.Service.Utils
{
  public enum OutputType
  {
    StdOut,
    StdErr,
  }

  internal static class ObservableExtentions
  {
    public static IObservable<T> After<T>(this IObservable<T> @this, Action action ) =>
    @this.Concat(Observable.Defer<T>(()=>{
       try{
            action();
            return Observable.Empty<T>();
       } catch (Exception ex){
           return Observable.Throw<T>(ex);
       }
       }));
   }

  internal static class StreamExtentions
  {

    public static T[] Slice<T>(this T[] @this, int count)
    {
      var slice = new T[count];
      Buffer.BlockCopy(@this, 0, slice, 0, count);
      return slice;
    }
    public static IObservable<byte[]> ToObservable(this Stream @this, int bufferSize = 1024)
    {
      return Observable.FromAsync(async (ct) =>
      {
        var buffer = new byte[bufferSize];
        var read = await @this.ReadAsync(buffer, 0, bufferSize, ct);
        return (read, buffer);
      })
      .Repeat()
      .TakeWhile(x => x.read > 0)
      .Select(x => x.read == bufferSize ? x.buffer : x.buffer.Slice(x.read));
    }
  }

  public class ShellHelper
  {

    public static Process ExecProcess(string command, string args, Action<ProcessStartInfo> paramsInit = null)
    {
      //paramsInit = paramsInit ??(p) => { };
      var escapedArgs = args.Replace("\"", "\\\"");
      var startInfo = new ProcessStartInfo
      {
        FileName = command,
        Arguments = escapedArgs,
        RedirectStandardOutput = true,
        RedirectStandardError = true,
        UseShellExecute = false,
        CreateNoWindow = true,
      };
      paramsInit?.Invoke(startInfo);
      var process = new Process()
      {
        StartInfo = startInfo,
      };

      if (!process.Start())
      {
        throw new Exception("failed to start process");
      };
      return process;
    }

    public static IObservable<(byte[] data, OutputType outputType)> Exec(string command, string args, Action<ProcessStartInfo> paramsInit = null)
    {
      return Observable.Defer(() =>
      {
        var process = ExecProcess(command, args, paramsInit);
        var sbErr = new StringBuilder();
        
        return Observable
            .Merge(
                    process.StandardOutput.BaseStream.ToObservable().Select(data => (data, OutputType.StdOut)),
                    process.StandardError.BaseStream.ToObservable().Select(data =>
                    {
                      sbErr.Append(Encoding.Default.GetString(data));
                      return (data, OutputType.StdErr);
                    })
            )
            .After(() => {
                if (process.ExitCode != 0) throw new Exception($"proccess failed")
                {
                  Data ={
                                    ["ExitCode"] = process.ExitCode,
                                    ["StdErr"] = sbErr.ToString(),
                        }
                };
            })
            .Publish().RefCount();
      });

    }

    public static async Task<string> ExecTask(string command, string args, Action<ProcessStartInfo> paramsInit = null)
    {
      return await Exec(command, args, paramsInit)
              .Where(x => x.outputType == OutputType.StdOut)
              .Aggregate("", (acc, x) => acc + Encoding.Default.GetString(x.data));
    }

    public static Func<string, Task<string>> CreateCommandExecutor(string command, Action<ProcessStartInfo> paramsInit = null) => (string args) =>
               ExecTask(command, args, paramsInit);
  }
}