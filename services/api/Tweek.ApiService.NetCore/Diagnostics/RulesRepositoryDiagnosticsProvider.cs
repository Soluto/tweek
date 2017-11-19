using System;
using Engine.Drivers.Rules;
using Tweek.ApiService.Addons;

namespace Tweek.ApiService.NetCore.Diagnostics
{
    public class RulesRepositoryDiagnosticsProvider : IDiagnosticsProvider
    {
        private readonly IRulesRepository mRepository;

        public RulesRepositoryDiagnosticsProvider(IRulesRepository repository)
        {
            mRepository = repository;
        }
        public string Name { get; } = "RulesRepository";
        public object GetDetails() => new {mRepository.CurrentLabel, mRepository.LastCheckTime };

        public bool IsAlive() => !string.IsNullOrEmpty(mRepository.CurrentLabel) && DateTime.UtcNow - mRepository.LastCheckTime < TimeSpan.FromMinutes(5);
    }
}
