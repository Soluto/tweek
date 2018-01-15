using System;
using System.IO.Compression;
using System.Threading.Tasks;
using Minio;
using RestSharp.Serializers;
using Tweek.Publishing.Common;
using Tweek.Publishing.Service.Storage;

namespace Tweek.Publishing.Service
{
    class VersionsBlob{
        public string latest;
        public string previous;
    }

  public class RepoSynchonizer
    {
        private readonly Func<string, Task<string>> _git;
        private readonly IObjectStorage _minioClient;
        public RepoSynchonizer(IObjectStorage storageClient){
            this._git = ShellHelper.CreateCommandExecutor("git");
            this._minioClient = storageClient;
        }

        public async Task Sync(){
            await _git("git fetch origin '+refs/heads/*:refs/heads/*'");
            var commitId = await _git("git rev-parse HEAD");
            var versionsBlob = await _minioClient.GetJSON<VersionsBlob>("latest");
            if (versionsBlob.latest == commitId) return;
            var newVersionBlob = new VersionsBlob(){
                latest = commitId,
                previous = versionsBlob.latest
            };
            
            await _minioClient.PutJSON("latest",newVersionBlob);
            var p = ShellHelper.ExecProcess("git", $"archive --format=zip {commitId}", "/tweek/repo");
            /*using (var zip = new ZipArchive(p.StandardOutput.BaseStream, ZipArchiveMode.Read, false )){
                (IEnumrable)zip.Entries.
                foreach (var item in zip.Entries){

                }
            }*/
        }
    }
}