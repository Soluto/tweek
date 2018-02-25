using Minio.Exceptions;
using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Threading.Tasks;
using Tweek.Publishing.Service.Packing;
using Tweek.Publishing.Service.Storage;
using Tweek.Publishing.Service.Utils;

namespace Tweek.Publishing.Service.Sync.Uploaders
{
    public class RulesUploader : IUploader
    {
        private readonly IObjectStorage _client;
        private readonly Packer _packer;
        private readonly ShellHelper.ShellExecutor _shellExecutor;

        public RulesUploader(IObjectStorage storageClient, ShellHelper.ShellExecutor shellExecutor, Packer packer)
        {
            _client = storageClient;
            _packer = packer;
            _shellExecutor = shellExecutor;
        }

        public async Task Upload(string commitId)
        {
            var (p, exited) = _shellExecutor("git", $"archive --format=zip {commitId}");
            using (var ms = new MemoryStream())
            {
                await p.StandardOutput.BaseStream.CopyToAsync(ms);
                ms.Position = 0;
                await exited;

                if (p.ExitCode != 0)
                {
                    throw new Exception("Git archive failed")
                    {
                        Data =
                        {
                            ["stderr"] = await p.StandardError.ReadToEndAsync(),
                            ["code"] = p.ExitCode,
                        },
                    };
                }

                using (var zip = new ZipArchive(ms, ZipArchiveMode.Read, false))
                {
                    var files = zip.Entries.Select(x => x.FullName).ToList();
                    var bundle = _packer.Pack(files, GetZipReader(zip));
                    await _client.PutJSON(commitId, bundle);
                }
            }            
        }

        private static Func<string, string> GetZipReader(ZipArchive zip) => 
            fileName => 
            {
                using (var sr = new StreamReader(zip.GetEntry(fileName).Open()))
                {
                    return sr.ReadToEnd();
                }
            };
            
    }
}



