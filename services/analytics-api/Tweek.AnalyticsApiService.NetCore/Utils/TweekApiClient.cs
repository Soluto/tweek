using System;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace Tweek.AnalyticsApiService.NetCore.Utils
{
    public class TweekApiClient
    {
        private readonly string _url;

        public TweekApiClient(string url)
        {
            _url = url.Trim('/') + '/';
        }

        public async Task<T> Get<T>(string path)
        {			
            var uri =_url + path.Trim('/');
			using (var httpClient = new HttpClient())
			{
				return JsonConvert.DeserializeObject<T>(await httpClient.GetStringAsync(uri));				
			}
        }
    }
}
