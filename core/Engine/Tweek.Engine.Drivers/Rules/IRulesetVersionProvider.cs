using System;

namespace Tweek.Engine.Drivers.Rules
{
    public interface IRulesetVersionProvider
    {
        IObservable<string> OnVersion();
    }
}