using System.Net.Http;
using App.Metrics;
using App.Metrics.Counter;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Tweek.Publishing.Service.Model.Hooks;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using System;
using System.Text;

namespace Tweek.Publishing.Helpers {
  public class TriggerHooksHelper {
    private readonly IMetrics _metrics;
    private readonly ILogger _logger;
    private readonly HttpClient _client;
    private readonly CounterOptions _hooksMetric = new CounterOptions{Context = "publishing", Name = "hooks"};
    private readonly MetricTags _metricsSuccess = new MetricTags("Status", "Success");
    private readonly MetricTags _metricsFailure = new MetricTags("Status", "Failure");

    public TriggerHooksHelper(HttpClient client, IMetrics metrics, ILogger logger = null) {
      this._logger = logger ?? NullLogger.Instance;
      this._client = client;
      this._metrics = metrics;
    }

    public async Task TriggerHooks(Dictionary<Hook, string> hooksWithData, string commitId) {
      var triggerTasks = hooksWithData.Select( kvp => ( task: TriggerHook(kvp.Key, kvp.Value), hook: kvp.Key ) );

      foreach (var triggerTask in triggerTasks) {
        try {
          await triggerTask.task;

          _metrics.Measure.Counter.Increment(_hooksMetric, _metricsSuccess);
        } catch (Exception ex) {
          _logger.LogError(ex, $"Failed triggering a hook of type {triggerTask.hook.Type} for commit {commitId}");
          _metrics.Measure.Counter.Increment(_hooksMetric, _metricsFailure);
        }
      }
    }

    private async Task TriggerHook(Hook hook, string payload) {
      switch (hook.Type) {
        case "notification_webhook":
          await TriggerNotificationWebhook(hook.Url, payload);
          break;
        default:
          throw new Exception($"Failed to trigger hook, invalid type: {hook.Type}");
      }
    }

    private async Task TriggerNotificationWebhook(string url, string payload) {
      var response = await _client.PostAsync(url, new StringContent(payload, Encoding.UTF8, "application/json"));
      response.EnsureSuccessStatusCode();
    }
  }
}