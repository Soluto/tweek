using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Engine.DataTypes;
using Newtonsoft.Json.Linq;
using RestEase;

namespace Tweek.ApiService.Tests
{
    public interface IConfigurationsApi
    {
        [Get("configurations/{keyPath}")]
        Task<JToken> Get([Path] string keyPath,[QueryMap] Dictionary<string, string> context);
    }
}
