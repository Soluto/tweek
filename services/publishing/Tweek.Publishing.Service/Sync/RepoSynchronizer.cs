using System;
using System.Threading.Tasks;
using System.Diagnostics;

namespace Tweek.Publishing.Service.Sync
{
    public class RepoSynchronizer
    {
        private readonly Func<string, Task<string>> _git;

        public RepoSynchronizer(Func<string, Task<string>> gitExecutor)
        {
            _git = gitExecutor;
        }

        public async Task<string> SyncToLatest()
        {
            // TEMP HACK - should be replaced in the future once corefx support running process as user
            // would be fixed in next dotnet release
            // 
            // https://github.com/dotnet/corefx/pull/26431
            // https://github.com/dotnet/corefx/blob/master/src/System.Diagnostics.Process/src/System/Diagnostics/Process.Unix.cs#L309 
            await Task.Run(()=>{
                var processName = "/bin/su";
                var args = "- git  -s \"/bin/bash\" -c \"cd $REPO_LOCATION && source ~/.env && git fetch origin '+refs/heads/*:refs/heads/*'\"";
                var process = Process.Start(new ProcessStartInfo(){
                    UseShellExecute= true,
                    FileName= processName,
                    Arguments = args
                });
                process.WaitForExit();
                if (process.ExitCode != 0){
                     throw new Exception("proccess failed")
                            {
                                Data =
                                {
                                    ["Command"] = processName,
                                    ["Args"] = args,
                                    ["ExitCode"] = process.ExitCode
                                }
                            };
                }
            });
    
            return await CurrentHead();
        }

        public async Task<string> CurrentHead()
        {
            return (await _git("rev-parse HEAD")).TrimEnd();
        }
    }
}