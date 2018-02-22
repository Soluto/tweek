using System;
using System.Reactive.Linq;
using System.Threading.Tasks;

namespace Tweek.Publishing.Service.Messaging
{
    public class IntervalPublisher
    {
        private readonly Func<string, Task> _publisher;

        public IntervalPublisher(Func<string, Task> publisher)
        {
            _publisher = publisher;
        }

        public IDisposable PublishEvery(TimeSpan interval, Func<Task<string>> getMessage)
        {
            return Observable.FromAsync(async () => await _publisher(await getMessage()))
                .DelaySubscription(interval)
                .Repeat()
                .Retry()
                .Subscribe();
        }
    }
}