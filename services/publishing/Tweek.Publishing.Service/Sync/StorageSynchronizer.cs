using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Minio.Exceptions;
using Tweek.Publishing.Service.Packing;
using Tweek.Publishing.Service.Storage;
using Tweek.Publishing.Service.Sync.Transferrers;
using Tweek.Publishing.Service.Utils;

namespace Tweek.Publishing.Service.Sync
{
    public class StorageSynchronizer
    {
        private readonly IObjectStorage _client;
        private readonly ShellHelper.ShellExecutor _shellExecutor;

        public List<ITransferrer> Transferrers = new List<ITransferrer>();

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

            foreach (var transferrer in Transferrers)
            {
                transferrer.Transfer(commitId);
            }

            await _client.PutJSON("versions", newVersionBlob);

            if (versionsBlob?.Previous != null)
            {
                await _client.Delete(versionsBlob.Previous);
            }
        }
    }
}