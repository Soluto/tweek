using Minio.Exceptions;
using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Threading.Tasks;
using Tweek.Publishing.Service.Storage;
using Tweek.Publishing.Service.Utils;

namespace Tweek.Publishing.Service.Sync.Uploaders
{
    public class PolicyUploader : IUploader
    {
        private readonly IObjectStorage _client;
        private readonly ShellHelper.ShellExecutor _shellExecutor;

        public PolicyUploader(IObjectStorage storageClient, ShellHelper.ShellExecutor shellExecutor)
        {
            _client = storageClient;
            _shellExecutor = shellExecutor;
        }

        public async Task Upload(string commitId)
        {
            var csv = await _shellExecutor.ExecTask("git", $"show {commitId}:policy.csv");
            await _client.PutString("policy.csv", csv, "application/csv");
        }        
    }
}



