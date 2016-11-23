using System.Collections.Generic;

namespace Tweek.Drivers.Blob
{
    public class DictionaryEqualityComparer<TKey, TValue> : IEqualityComparer<Dictionary<TKey, TValue>>
    {
        private readonly IEqualityComparer<TValue> _valueComparer;

        public DictionaryEqualityComparer(IEqualityComparer<TValue> valueComparer = null)
        {
            _valueComparer = valueComparer ?? EqualityComparer<TValue>.Default;
        }

        public bool Equals(Dictionary<TKey, TValue> dict1, Dictionary<TKey, TValue> dict2)
        {
            if (dict1 == dict2) return true;
            if ((dict1 == null) || (dict2 == null)) return false;
            if (dict1.Count != dict2.Count) return false;


            foreach (var kvp in dict1)
            {
                TValue value2;
                if (!dict2.TryGetValue(kvp.Key, out value2)) return false;
                if (!_valueComparer.Equals(kvp.Value, value2)) return false;
            }
            return true;
        }

        public int GetHashCode(Dictionary<TKey, TValue> obj)
        {
            return obj.GetHashCode();
        }
    }
}