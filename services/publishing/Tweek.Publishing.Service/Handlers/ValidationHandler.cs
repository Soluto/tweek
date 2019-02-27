using System;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using App.Metrics;
using App.Metrics.Counter;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Logging;
using Tweek.Publishing.Service.Validation;
using static Tweek.Publishing.Service.Utils.ShellHelper;

namespace Tweek.Publishing.Service.Handlers
{
    public class ValidationHandler
    {
        private static readonly CounterOptions Validation = new CounterOptions
            {Context = "publishing", Name = "validation"};

        private static readonly MetricTags Success = new MetricTags("Status", "Successful");
        private static readonly MetricTags Failure = new MetricTags("Status", "Failure");

        public static Func<HttpRequest, HttpResponse, RouteData, Task> Create(ShellExecutor executor, GitValidationFlow gitValidationFlow, ILogger logger, IMetrics metrics) =>
            async (req, res, routedata) =>
            {
                var oldCommit = req.Query["oldrev"].ToString().Trim();
                var newCommit = req.Query["newrev"].ToString().Trim();
                if (!Regex.IsMatch(oldCommit, "^[a-f0-9]+$") || !Regex.IsMatch(newCommit, "^[a-f0-9]+$"))
                {
                    res.StatusCode = 400;
                    await res.WriteAsync("Invalid commit id");
                    return;
                }

                var quarantinePath = req.Query["quarantinepath"].ToString();
                var objectsDir = quarantinePath.Substring(quarantinePath.IndexOf("./objects"));
                var gitExecutor = executor.CreateCommandExecutor("git", pStart =>
                {
                    pStart.Environment["GIT_ALTERNATE_OBJECT_DIRECTORIES"] = "./objects";
                    pStart.Environment["GIT_OBJECT_DIRECTORY"] = objectsDir;
                });
                try
                {
                    await gitValidationFlow.Validate(oldCommit, newCommit, gitExecutor);
                    metrics.Measure.Counter.Increment(Validation, Success);
                }
                catch (Exception ex)
                {
                    metrics.Measure.Counter.Increment(Validation, Failure);
                    res.StatusCode = 400;
                    logger.LogWarning("Validation failed, {error}", ex.Message);
                    await res.WriteAsync(ex.Message);
                }
            };
    }
}