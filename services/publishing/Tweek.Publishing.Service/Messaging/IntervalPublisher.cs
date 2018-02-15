using System;
using System.Reactive.Linq;
using System.Threading.Tasks;

namespace Tweek.Publishing.Service.Messaging
{
    public class IntervalPublisher
    {
        private readonly NatsPublisher _publisher;
        private readonly string _subject;

        public IntervalPublisher(NatsPublisher publisher, string subject)
        {
            _publisher = publisher;
            _subject = subject;
        }

        public IDisposable PublishEvery(TimeSpan interval, Func<Task<string>> getMessage)
        {
            return Observable.FromAsync(async () => await _publisher.Publish(_subject, await getMessage()))
                .DelaySubscription(interval)
                .Repeat()
                .Retry()
                .Subscribe();
        }
    }
}