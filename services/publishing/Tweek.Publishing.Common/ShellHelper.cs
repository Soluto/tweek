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

namespace Tweek.Publishing.Common
{
    public enum OutputType{
            StdOut,
            StdErr,
    }

    internal static class ObservableExtentions{
        public static IObservable<TResult> With<TResult, TOther>(this IObservable<TResult> @this, IObservable<TOther> context)
            {
                return Observable.Create<TResult>(observer =>
                {
                    var mainSubscription = @this.Subscribe(observer);
                    var contextSubscription = context.Subscribe(_ => { }, observer.OnError);
                    return new CompositeDisposable(contextSubscription, mainSubscription);
                });
            }
    }

    internal static class StreamExtentions{

        public static T[] Slice<T>(this T[] @this, int count){
            var slice = new T[count];
            Buffer.BlockCopy(@this, 0, slice, 0, count);
            return slice;
        }
        public static IObservable<byte[]> ToObservable(this Stream @this, int bufferSize = 1024)
            {
                return Observable.FromAsync(async (ct)=> {
                    var buffer = new byte[bufferSize];
                    var read = await @this.ReadAsync(buffer, 0, bufferSize, ct);
                    return (read, buffer);
                })
                .Repeat()
                .TakeWhile(x=> x.read > 0)
                .Select(x=> x.read == bufferSize ? x.buffer : x.buffer.Slice(x.read));
            }
    }
   
    public class ShellHelper {
        
        public static Process ExecProcess(string command, string args, string cwd = null){
            var escapedArgs = args.Replace("\"", "\\\"");
                var process = new Process(){
                            StartInfo = new ProcessStartInfo{
                                FileName = command,
                                Arguments = escapedArgs,
                                WorkingDirectory = cwd,
                                RedirectStandardOutput = true,
                                RedirectStandardError = true,
                                UseShellExecute = false,
                                CreateNoWindow = true,
                            },
                            EnableRaisingEvents = true
                        };
            if (!process.Start()){
                throw new Exception("failed to start process");
            };
            return process;
        }
        
        public static IObservable<(byte[] data, OutputType outputType)> Exec(string command, string args, string cwd = null){
            return Observable.Defer( ()=> {
                var process = ExecProcess(command, args, cwd);
                var sbErr = new StringBuilder();
                var exit = Observable.FromEventPattern(
                    h=> process.Exited += h,
                    h=> process.Exited -= h)
                    .FirstAsync()
                    .SelectMany(e=>{
                        if (process.ExitCode == 0){
                            return Observable.Empty<Unit>();
                        }
                        else {
                            return Observable.Throw<Unit>(new Exception($"proccess failed") {
                                Data ={
                                    ["ExitCode"] = process.ExitCode,
                                    ["StdErr"] = sbErr.ToString(),
                                }
                            });
                        }
                    });

                return Observable.Merge(
                            process.StandardOutput.BaseStream.ToObservable().Select(data=> (data, OutputType.StdOut)),
                            process.StandardError.BaseStream.ToObservable().Select(data => {
                                sbErr.AppendLine(Encoding.Default.GetString(data));
                                return (data, OutputType.StdErr);
                            })
                    ).Publish().RefCount();
                });

        }
       
        public static async Task<string> ExecTask(string command, string args, string cwd = null){
            return await Exec(command, args, cwd)
                    .Where(x=>x.outputType == OutputType.StdOut)
                    .Aggregate("", (acc , x) => acc + Encoding.Default.GetString(x.data));
        }

        public static Func<string,Task<string>> CreateCommandExecutor(string command, string cwd=null) => (string args) => 
                ExecTask(command, args, cwd);
    }
}
