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

  public class StorageSynchronizer
  {
    private readonly IObjectStorage _client;
    public StorageSynchronizer(IObjectStorage storageClient)
    {
      this._client = storageClient;
    }

    public async Task Sync(string commitId)
    {
      VersionsBlob versionsBlob = null;
      try
      {
        versionsBlob = await _client.GetJSON<VersionsBlob>("versions");
      }
      catch (Minio.Exceptions.ObjectNotFoundException ex)
      {

      }

      if (versionsBlob?.latest == commitId) return;

      var newVersionBlob = new VersionsBlob()
      {
        latest = commitId,
        previous = versionsBlob?.latest
      };

      var packer = new Packer();

      var p = ShellHelper.ExecProcess("git", $"archive --format=zip {commitId}", (pStart) => pStart.WorkingDirectory = "/tweek/repo");
      using (var ms = new MemoryStream())
      {
        await p.StandardOutput.BaseStream.CopyToAsync(ms);
        ms.Position = 0;
        p.WaitForExit();
        if (p.ExitCode != 0){
          throw new Exception("Git archive failed"){
            Data = {
              ["stderr"] = await p.StandardError.ReadToEndAsync(),
              ["code"] = p.ExitCode
            }
          };
        }
        using (var zip = new ZipArchive(ms, ZipArchiveMode.Read, false))
        {
          var dir = zip.Entries.ToDictionary(x => x.FullName, x => fun(async () =>
          {
            using (var sr = new StreamReader(x.Open()))
            {
              return await sr.ReadToEndAsync();
            }
          }));

          var bundle = await packer.Pack(dir);

          await _client.PutJSON(commitId, bundle);
        }
      }
      await _client.PutJSON("versions", newVersionBlob);
    }
  }
}