using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Tweek.Publishing.Service.Validation;
using static Tweek.Publishing.Service.Utils.ShellHelper;

namespace Tweek.Publishing.Service.Handlers
{
    public class ValidationHandler
    {
        public static Func<HttpRequest, HttpResponse, RouteData, Task> Create(ShellExecutor executor, GitValidationFlow gitValidationFlow) =>
            async (req, res, routedata) =>
            {
                var oldCommit = req.Query["oldrev"].ToString().Trim();
                var newCommit = req.Query["newrev"].ToString().Trim();
                var quarantinePath = req.Query["quarantinepath"];
                var gitExecutor = executor.CreateCommandExecutor("git", pStart =>
                {
                    pStart.Environment["GIT_ALTERNATE_OBJECT_DIRECTORIES"] = "./objects";
                    pStart.Environment["GIT_OBJECT_DIRECTORY"] = quarantinePath;
                });
                try
                {
                    await gitValidationFlow.Validate(oldCommit, newCommit, gitExecutor);
                }
                catch (Exception ex)
                {
                    res.StatusCode = 400;
                    await res.WriteAsync(ex.Message);
                }
            };
    }
}