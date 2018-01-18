using System;
using System.IO.Compression;
using System.Threading.Tasks;
using Minio;
using RestSharp.Serializers;
using Tweek.Publishing.Service.Storage;
using System.Collections.Generic;
using System.Linq;
using Tweek.Publishing.Service.Utils;
using static LanguageExt.Prelude;
using System.IO;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using Tweek.Publishing.Service.Packing;

namespace Tweek.Publishing.Service
{

  public class RepoSynchronizer
  {
    private readonly Func<string, Task<string>> _git;
    private readonly IObjectStorage _minioClient;
    public RepoSynchronizer(IObjectStorage storageClient)
    {
      this._git = ShellHelper.CreateCommandExecutor("git");
      this._minioClient = storageClient;
    }

    public async Task Sync()
    {
      await _git("git fetch origin '+refs/heads/*:refs/heads/*'");
      var commitId = await _git("git rev-parse HEAD");
      var versionsBlob = await _minioClient.GetJSON<VersionsBlob>("latest");
      if (versionsBlob.latest == commitId) return;

      var newVersionBlob = new VersionsBlob()
      {
        latest = commitId,
        previous = versionsBlob.latest
      };

      var packer = new Packer();

      var p = ShellHelper.ExecProcess("git", $"archive --format=zip {commitId}", (pStart) => pStart.WorkingDirectory = "/tweek/repo");
      using (var zip = new ZipArchive(p.StandardOutput.BaseStream, ZipArchiveMode.Read, false))
      {
        var dir = zip.Entries.ToDictionary(x => x.FullName, x => fun(async () =>
        {
          using (var sr = new StreamReader(x.Open()))
          {
            return await sr.ReadToEndAsync();
          }
        }));

        var bundle = packer.Pack(dir);

        await _minioClient.PutJSON(commitId, bundle);
      }
      
      await _minioClient.PutJSON("latest", newVersionBlob);
    }
  }
}