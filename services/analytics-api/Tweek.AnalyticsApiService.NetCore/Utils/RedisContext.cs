using System;
using ServiceStack.Redis;

namespace Tweek.AnalyticsApiService.NetCore.Utils
{
    public class RedisContext
    {
        private readonly string _url;

        public RedisContext(string url)
        {
            _url = url;
        }

        public T PersistenceAction<T>(Func<IRedisClient, T> action)
        {
            var manager = new RedisManagerPool(_url);
            using (var client = manager.GetClient())
            {
                // TODO: change to client with async api
                return action(client);
            }
        }
    }
}
