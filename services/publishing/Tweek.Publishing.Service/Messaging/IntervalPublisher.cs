using System;
using System.Reactive.Linq;
using System.Threading.Tasks;

namespace Tweek.Publishing.Service.Messaging
{
    public class IntervalPublisher
    {
    private readonly NatsPublisher _publisher;

    public IntervalPublisher(NatsPublisher publisher){
            _publisher = publisher;
        }

        public IDisposable PublishEvery(TimeSpan interval, Func<Task<string>> GetMessage){
            return Observable.FromAsync(GetMessage)
                .DelaySubscription(interval)
                .Repeat()
                .Retry()
                .Subscribe();
        }
    }
}