using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Threading.Tasks;
using Minio.Exceptions;
using Tweek.Publishing.Service.Packing;
using Tweek.Publishing.Service.Storage;
using Tweek.Publishing.Service.Sync.Uploaders;
using Tweek.Publishing.Service.Utils;

namespace Tweek.Publishing.Service.Sync
{
    public class StorageSynchronizer
    {
        private readonly IObjectStorage _client;
        private readonly ShellHelper.ShellExecutor _shellExecutor;

        public List<IUploader> Uploaders = new List<IUploader>();

        public StorageSynchronizer(IObjectStorage storageClient, ShellHelper.ShellExecutor shellExecutor)
        {
            _client = storageClient;
            _shellExecutor = shellExecutor;
        }

        public async Task Sync(string commitId, bool checkForStaleRevision=true)
        {
            VersionsBlob versionsBlob = null;
            try
            {
                versionsBlob = await _client.GetJSON<VersionsBlob>("versions");
            }
            catch (ObjectNotFoundException)
            {
            }

            if (!String.IsNullOrWhiteSpace(versionsBlob?.Latest))
            {
                if (versionsBlob.Latest == commitId) return;
                if (checkForStaleRevision)
                {
                    try
                    {
                        await _shellExecutor.ExecTask("git", $"merge-base --is-ancestor {versionsBlob.Latest} {commitId}");
                    }
                    catch (Exception)
                    {
            
                        throw new StaleRevisionException(commitId, versionsBlob.Latest);
                    }
                }
            };
            
            var newVersionBlob = new VersionsBlob
            {
                Latest = commitId,
                Previous = versionsBlob?.Latest,
            };

            foreach (var uploader in Uploaders)
            {
                await uploader.Upload(commitId);

            }

            await _client.PutJSON("versions", newVersionBlob);

            if (versionsBlob?.Previous != null)
            {
                await _client.Delete(versionsBlob.Previous);
            }
        }
    }
}