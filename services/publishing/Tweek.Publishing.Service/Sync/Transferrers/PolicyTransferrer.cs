using Minio.Exceptions;
using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using Tweek.Publishing.Service.Storage;
using Tweek.Publishing.Service.Utils;

namespace Tweek.Publishing.Service.Sync.Transferrers
{
    public class PolicyTransferrer : ITransferrer
    {
        private readonly IObjectStorage _client;
        private readonly ShellHelper.ShellExecutor _shellExecutor;

        public PolicyTransferrer(IObjectStorage storageClient, ShellHelper.ShellExecutor shellExecutor)
        {
            _client = storageClient;
            _shellExecutor = shellExecutor;
        }

        public async void Transfer(string commitId)
        {
            var (s, zeu) = _shellExecutor("git", "ls-tree -r master --name-only");
            await s.StandardOutput.BaseStream.CopyToAsync(Console.OpenStandardOutput());
            await zeu;
            if(s.ExitCode != 0)
            {
                throw new Exception("Git ls-tree failed");
            }
            


            var (p, exited) = _shellExecutor("git", $"show {commitId}:policy.csv");
            using (var ms = new MemoryStream())
            {
                await p.StandardOutput.BaseStream.CopyToAsync(ms);
                ms.Position = 0;
                await exited;

                if (p.ExitCode != 0)
                {
                    throw new Exception("Git show failed")
                    {
                        Data =
                        {
                            ["stderr"] = await p.StandardError.ReadToEndAsync(),
                            ["code"] = p.ExitCode,
                        },
                    };
                }

                await _client.PutStream("policy.csv", ms, "application/csv");                
            }            
        }        
    }
}



