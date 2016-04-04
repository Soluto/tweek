using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Engine.DataTypes;

namespace Tweek.ApiService
{
    public class TreeResult
    {
        public static object From(Dictionary<ConfigurationPath, ConfigurationValue> configuration)
        {
            var builder = new TreeBuilder();

            foreach (var item in configuration)
            {
                if (item.Key == "") return item.Value.Value;
                builder[item.Key] = item.Value.Value;
            }
            return builder.ToDictionary();
        }
    }

    public class TreeBuilder
    {
        private readonly Dictionary<string, object> _dictionary;

        public TreeBuilder()
        {
            _dictionary = new Dictionary<string, object>();
        }

        private Dictionary<string, object> GetOrCreateContainer(IEnumerable<string> indexes)
        {
            return indexes.Aggregate(_dictionary, (a, b) =>
            {
                if (!a.ContainsKey(b)) a[b] = new Dictionary<string, object>();
                return a[b] as Dictionary<string, object>;
            });
        }

        private IEnumerable<string> ExtractLocationFragments(ConfigurationPath path)
        {
            return path.Prefix.Split('/').SkipWhile(x => x == "");
        }

        public object this[ConfigurationPath path]
        {
            set
            {
                GetOrCreateContainer(ExtractLocationFragments(path))[path.Name] = value;
            }
        }

        public IDictionary<string, object> ToDictionary()
        {
            return _dictionary;
        }
    }
}