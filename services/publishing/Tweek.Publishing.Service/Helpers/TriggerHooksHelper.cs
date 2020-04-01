using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using App.Metrics;
using App.Metrics.Counter;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Newtonsoft.Json;

namespace Tweek.Publishing.Helpers {
  public class TriggerHooksHelper {
    private readonly IMetrics _metrics;
    private readonly ILogger _logger;
    private readonly HttpClient _client;
    private readonly CounterOptions _hooksMetric = new CounterOptions{Context = "publishing", Name = "hooks"};
    private readonly MetricTags _metricsSuccess = new MetricTags("Status", "Success");
    private readonly MetricTags _metricsFailure = new MetricTags("Status", "Failure");

    public TriggerHooksHelper(HttpClient client, IMetrics metrics, ILogger logger = null) {
      _logger = logger ?? NullLogger.Instance;
      _client = client;
      _metrics = metrics;
    }

    public async Task TriggerHooks(Dictionary<(string type, string url), HookData> hooksWithData, string commitId) {
      var triggerTasks = hooksWithData.Select( kvp => ( task: TriggerHook(kvp.Key, kvp.Value), hookType: kvp.Key.type ) );

      foreach (var (task, hookType) in triggerTasks) {
        try {
          await task;

          _metrics.Measure.Counter.Increment(_hooksMetric, _metricsSuccess);
        } catch (Exception ex) {
          _logger.LogError(ex, $"Failed triggering a hook of type {hookType} for commit {commitId}");
          _metrics.Measure.Counter.Increment(_hooksMetric, _metricsFailure);
        }
      }
    }

    private async Task TriggerHook(( string type, string url ) hook, HookData payload)
    {
      var (type, url) = hook;
      
      switch (type) {
        case "notification_webhook":
          await TriggerNotificationWebhook(url, payload);
          break;
        case "slack_webhook":
          await TriggerSlackWebhook(url, payload);
          break;
        default:
          throw new Exception($"Failed to trigger hook, invalid type: {type}");
      }
    }

    private async Task TriggerSlackWebhook(string url, HookData payload)
    {
      var updates = string.Join(',', payload.updates.Select(update =>
      {
        if (!update.oldValue.HasValue && !update.newValue.HasValue)
        {
          return "";
        }

        if (!update.newValue.HasValue)
        {
          return "deleted " + update.oldValue.Value.implementation;
        }
        
        if (!update.oldValue.HasValue)
        {
          return "created " + update.newValue.Value.implementation;
        }

        return update.oldValue.Value.implementation + " => " + update.newValue.Value.implementation;
      }));
      
      var text = $"Tweek key changed!\n{updates}\nChanged by: {payload.author.name} <{payload.author.email}>";
      
      var response = await _client.PostAsync(url, new StringContent( JsonConvert.SerializeObject(new { text }), Encoding.UTF8, "application/json"));
      response.EnsureSuccessStatusCode();
    }

    private async Task TriggerNotificationWebhook(string url, HookData payload) {
      var response = await _client.PostAsync(url, new StringContent(JsonConvert.SerializeObject(payload), Encoding.UTF8, "application/json"));
      response.EnsureSuccessStatusCode();
    }
  }
}