using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Threading.Tasks;
using App.Metrics;
using App.Metrics.Counter;
using Minio.Exceptions;
using Tweek.Publishing.Service.Model;
using Tweek.Publishing.Service.Model.Rules;
using Tweek.Publishing.Service.Storage;
using Tweek.Publishing.Service.Sync.Converters;
using Tweek.Publishing.Service.Utils;

namespace Tweek.Publishing.Service.Sync
{
    public class StorageSynchronizer
    {
        private readonly IObjectStorage _client;

        private readonly ShellHelper.ShellExecutor _shellExecutor;

        public List<IConverter> Converters = new List<IConverter>();
        private readonly IMetrics _metrics;
        private readonly CounterOptions _staleRevision = new CounterOptions{Context = "publishing", Name = "stale_revision"};
        private readonly CounterOptions _badRevision = new CounterOptions{Context = "publishing", Name = "bad_revision"};
        private readonly CounterOptions _archiveFailure = new CounterOptions {Context = "publishing", Name = "archive_failure"};
        private readonly CounterOptions _fileUpload = new CounterOptions{Context = "publishing", Name = "file_upload"};
        private readonly CounterOptions _deletePrevious = new CounterOptions{Context = "publishing", Name = "delete_previous"};

        public StorageSynchronizer(IObjectStorage storageClient, ShellHelper.ShellExecutor shellExecutor, IMetrics metrics)
        {
            _client = storageClient;
            _shellExecutor = shellExecutor;
            _metrics = metrics;
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

            if (!String.IsNullOrWhiteSpace(versionsBlob?.Latest)){
                if (versionsBlob.Latest == commitId && await _client.Exists(commitId)) return;
                if (checkForStaleRevision)
                {
                    try{
                        await _shellExecutor.ExecTask("git", $"merge-base --is-ancestor {versionsBlob.Latest} {commitId}");
                    }
                    catch (Exception ex){
                        // https://git-scm.com/docs/git-merge-base#git-merge-base---is-ancestor
                        if ((int)ex.Data["ExitCode"] == 1)
                        {
                            _metrics.Measure.Counter.Increment(_staleRevision);
                            throw new RevisionException(commitId, versionsBlob.Latest, "Stale Revision");
                        }

                        _metrics.Measure.Counter.Increment(_badRevision);
                        throw new RevisionException(commitId, versionsBlob.Latest, "Bad Revision");
                    }
                }
            };

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
                    await HandleArchiveError(p);
                }

                using (var zip = new ZipArchive(ms, ZipArchiveMode.Read, false))
                {
                    var files = zip.Entries.Select(x => x.FullName).ToList();
                    var readFn = GetZipReader(zip);

                    foreach(var Converter in Converters)
                    {                        
                        var (fileName, fileContent, fileMimeType) = Converter.Convert(commitId, files, readFn);
                        await _client.PutString(fileName, fileContent, fileMimeType);
                        _metrics.Measure.Counter.Increment(_fileUpload, new MetricTags("FileName", fileName));
                    }
                }
            }

            await _client.PutJSON("versions", newVersionBlob);
            _metrics.Measure.Counter.Increment(_fileUpload, new MetricTags("FileName", "versions"));

            if (versionsBlob?.Previous != null)
            {
                await _client.Delete(versionsBlob.Previous);
                _metrics.Measure.Counter.Increment(_deletePrevious);
            }        
        }

        private async Task HandleArchiveError(Process p)
        {            
            _metrics.Measure.Counter.Increment(_archiveFailure);
            throw new Exception("Git archive failed")
            {
                Data =
                {
                    ["stderr"] = await p.StandardError.ReadToEndAsync(),
                    ["code"] = p.ExitCode,
                },
            };            
        }

        private static Func<string, string> GetZipReader(ZipArchive zip) => 
            fileName =>
            {
                var entry = zip.GetEntry(fileName);
                if (entry == null)
                {
                    throw new NullReferenceException($"unable to find file: {fileName}");
                }
                using (var sr = new StreamReader(entry.Open()))
                {
                    return sr.ReadToEnd();
                }
            };


        

    }
}