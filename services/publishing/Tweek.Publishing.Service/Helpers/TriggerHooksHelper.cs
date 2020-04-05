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
using Tweek.Publishing.Service.Model.Hooks;

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

    public async Task TriggerHooks(Dictionary<Hook, HookData> hooksWithData, string commitId) {
      var triggerTasks = hooksWithData.Select( kvp => ( task: TriggerHook(kvp.Key, kvp.Value), hookType: kvp.Key.Type ) );
       
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

    private async Task TriggerHook(Hook hook, HookData hookData)
    {
      switch (hook.Type) {
        case "notification_webhook":
          switch (hook.Format)
          {
            case "slack":
              await TriggerWebhook(hook.Url, BuildSlackPayload(hookData));
            break;
            default:
              await TriggerWebhook(hook.Url, hookData);
              break;
          }
          break;
        default:
          throw new Exception($"Failed to trigger hook, invalid type: {hook.Type}");
      }
    }

    private static object BuildSlackPayload(HookData hookData)
    {
      var updates = string.Join('\n', hookData.updates.Select(update =>
      {
        if (!update.oldValue.HasValue && !update.newValue.HasValue)
        {
          return "";
        }
        
        if (!update.newValue.HasValue)
        {
          return $"key path: `{update.oldValue.Value.keyPath}`\ndeleted\n```{update.oldValue.Value.implementation}```";
        }
        
        if (!update.oldValue.HasValue)
        {
          return $"key path: `{update.newValue.Value.keyPath}`\ncreated\n```{update.newValue.Value.implementation}```";
        }

        return $"key path: `{update.newValue.Value.keyPath}`\nold:\n```{update.oldValue.Value.implementation}```\nnew:\n```{update.newValue.Value.implementation}```";
      }));
      
      var text = $"Tweek key changed!\n{updates}\nChanged by: {hookData.author.name} <{hookData.author.email}>";

      return new {text};
    }

    private async Task TriggerWebhook(string url, object payload)
    {
      var response = await _client.PostAsync(url, new StringContent( JsonConvert.SerializeObject(payload), Encoding.UTF8, "application/json"));
      response.EnsureSuccessStatusCode();
    }
  }
}