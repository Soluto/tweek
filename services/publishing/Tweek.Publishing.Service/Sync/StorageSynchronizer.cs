using System;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Threading.Tasks;
using Minio.Exceptions;
using Tweek.Publishing.Service.Packing;
using Tweek.Publishing.Service.Storage;
using Tweek.Publishing.Service.Utils;

namespace Tweek.Publishing.Service.Sync
{
    public class StorageSynchronizer
    {
        private readonly IObjectStorage _client;
        private readonly Packer _packer;
        private readonly ShellHelper.ShellExecutor _shellExecutor;

        public StorageSynchronizer(IObjectStorage storageClient, ShellHelper.ShellExecutor shellExecutor, Packer packer)
        {
            _client = storageClient;
            _packer = packer;
            _shellExecutor = shellExecutor;
        }

        private static Func<string, string> GetZipReader(ZipArchive zip)
        {
            return fileName =>
            {
                using (var sr = new StreamReader(zip.GetEntry(fileName).Open()))
                {
                    return sr.ReadToEnd();
                }
            };
        }

        public async Task Sync(string commitId)
        {
            VersionsBlob versionsBlob = null;
            try
            {
                versionsBlob = await _client.GetJSON<VersionsBlob>("versions");
            }
            catch (ObjectNotFoundException)
            {
            }

            if (versionsBlob?.Latest == commitId) return;

            var newVersionBlob = new VersionsBlob
            {
                Latest = commitId,
                Previous = versionsBlob?.Latest,
            };

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

            await _client.PutJSON("versions", newVersionBlob);

            if (versionsBlob?.Previous != null)
            {
                await _client.Delete(versionsBlob.Previous);
            }
        }
    }
}