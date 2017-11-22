using System;
using System.Collections.Generic;
using System.Text;

namespace Tweek.Engine.Drivers.Rules
{
    public class NatsVersionProvider: IRulesetVersionProvider
    {
        public IObservable<string> OnVersion()
        {
            throw new NotImplementedException();
        }
    }
}
