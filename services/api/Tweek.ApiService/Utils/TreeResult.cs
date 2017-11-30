using System.Collections.Generic;
using System.Linq;
using Tweek.Engine.DataTypes;

namespace Tweek.ApiService.Utils
{
    public delegate object TranslateValue(ConfigurationValue json);

    public class TreeResult
    {
        public static object From(Dictionary<ConfigurationPath, ConfigurationValue> configuration, TranslateValue translateValue)
        {
            var builder = new TreeBuilder();

            foreach (var item in configuration)
            {
                builder[item.Key] = translateValue(item.Value);
            }
            return builder.ToDictionary();
        }
    }

    public class TreeBuilder
    {
        private readonly SortedDictionary<string, object> _dictionary;

        public TreeBuilder()
        {
            _dictionary = new SortedDictionary<string,object>();
        }

        private SortedDictionary<string, object> GetOrCreateContainer(IEnumerable<string> indexes)
        {
            return indexes.Aggregate(_dictionary, (a, b) =>
            {
                if (!a.ContainsKey(b)) a[b] = new SortedDictionary<string, object>();
                return a[b] as SortedDictionary<string, object>;
            });
        }

        private static IEnumerable<string> ExtractLocationFragments(ConfigurationPath path)
        {
            var fragments = path.ToString().Split('/');
            return fragments.Take(fragments.Length - 1).SkipWhile(x => x == "");
        }

        public object this[ConfigurationPath path]
        {
            set => GetOrCreateContainer(ExtractLocationFragments(path))[path.Name] = value;
        }

        public IDictionary<string, object> ToDictionary()
        {
            return _dictionary;
        }
    }
}