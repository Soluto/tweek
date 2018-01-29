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
using System.Reactive.Linq;
using System.Reactive.Threading.Tasks;
using static Tweek.Publishing.Service.Utils.ShellHelper;

namespace Tweek.Publishing.Service
{

  public class StorageSynchronizer
  {
    private readonly IObjectStorage _client;
    private readonly Packer _packer;
    private readonly ShellExecutor _shellExecutor;

    public StorageSynchronizer(IObjectStorage storageClient, ShellExecutor shellExecutor, Packer packer)
    {
      this._client = storageClient;
      this._packer = packer;
      this._shellExecutor = shellExecutor;
    }

    private static Func<string,string> GetZipReader(ZipArchive zip)=> (string fileName)=>{
        using (var sr = new StreamReader(zip.GetEntry(fileName).Open()))
              return sr.ReadToEnd();
    };

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

      var (p, exited) = _shellExecutor("git", $"archive --format=zip {commitId}", (pStart) => pStart.WorkingDirectory = "/tweek/repo");
      using (var ms = new MemoryStream())
      {
        await p.StandardOutput.BaseStream.CopyToAsync(ms);
        ms.Position = 0;
        await exited;
        
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
          var files = zip.Entries.Select(x=>x.FullName).ToList();
          var bundle = _packer.Pack(files, GetZipReader(zip));
          await _client.PutJSON(commitId, bundle);
        }
      }
      await _client.PutJSON("versions", newVersionBlob);
    }
  }
}