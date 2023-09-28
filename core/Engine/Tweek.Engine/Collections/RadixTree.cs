using System;
using System.Collections.Generic;

namespace Tweek.Engine.Collections
{
    /// <summary>
    /// Tree implements a radix tree. This can be treated as a Dictionary abstract data type. 
    /// The main advantage over a standard hash map is prefix-based lookups and ordered iteration.
    /// </summary>
    internal class RadixTree<TValue>
    {
        private delegate void Walker(string key, TValue value);

        private readonly Node<TValue> _root = new Node<TValue>();
        private readonly Dictionary<string, TValue> _values = new Dictionary<string, TValue>();

        /// <summary>
        /// Initializes a new instance of the <see cref="RadixTree{TValue}"/> class.
        /// returns an empty Tree
        /// </summary>
        public RadixTree() { }

        /// <summary>
        /// Initializes a new instance of the <see cref="RadixTree{TValue}"/> class.
        /// returns a new tree containing the keys from an existing map
        /// </summary>
        /// <param name="map"></param>
        public RadixTree(IReadOnlyDictionary<string, TValue> map)
        {
            if (map == null)
                throw new ArgumentNullException(nameof(map));

            foreach (var kv in map)
            {
                Insert(kv.Key, kv.Value);
            }
        }

        /// <summary>
        /// The number of elements in the tree
        /// </summary>
        public int Count => _values.Count;

        /// <summary>
        /// Add a new entry or updates an existing entry
        /// </summary>
        /// <returns>is entry updated, and old value if it was</returns>
        public (TValue oldValue, bool updated) Insert(string key, TValue value)
        {
            _values[key] = value;

            var node = _root;
            var search = key;

            while (true)
            {
                // Handle key exhaution
                if (search.Length == 0)
                {
                    if (node.IsLeaf)
                    {
                        var old = node.Leaf.Value;
                        node.Leaf.Value = value;
                        return (old, true);
                    }

                    node.Leaf = new LeafNode<TValue>
                    {
                        Key = key,
                        Value = value,
                    };
                    return (default(TValue), false);
                }

                var parent = node;

                // Look for the edge
                // No edge, create one
                if (!node.TryGetEdge(search[0], out node))
                {
                    parent.AddEdge(search[0], new Node<TValue>
                    {
                        Leaf = new LeafNode<TValue>
                        {
                            Key = key,
                            Value = value,
                        },
                        Prefix = search,
                    });
                    return (default(TValue), false);
                }

                // Determine longest prefix of the search key on match
                var commonPrefix = FindLongestPrefix(search, node.Prefix);
                if (commonPrefix == node.Prefix.Length)
                {
                    search = search.Substring(commonPrefix);
                    continue;
                }

                // Split the node
                var child = new Node<TValue>
                {
                    Prefix = search.Substring(0, commonPrefix),
                };
                parent.SetEdge(search[0], child);

                // Restore the existing node
                child.AddEdge(node.Prefix[commonPrefix], node);
                node.Prefix = node.Prefix.Substring(commonPrefix);

                // Create a new leaf node
                var leaf = new LeafNode<TValue>
                {
                    Key = key,
                    Value = value,
                };

                // If the new key is a subset, add to to this node
                search = search.Substring(commonPrefix);
                if (search.Length == 0)
                {
                    child.Leaf = leaf;
                    return (default(TValue), false);
                }

                // Create a new edge for the node
                child.AddEdge(search[0], new Node<TValue>
                {
                    Leaf = leaf,
                    Prefix = search,
                });
                return (default(TValue), false);
            }
        }

        /// <summary>
        /// Delete a key
        /// </summary>
        /// <returns>is entry deleted, and the value what was deleted</returns>
        public (TValue oldValue, bool deleted) Delete(string key)
        {
            if (!_values.Remove(key)) return (default(TValue), false);

            Node<TValue> parent = null;
            var label = char.MinValue;
            var node = _root;
            var search = key;

            while (true)
            {
                // Check for key exhaution
                if (search.Length == 0)
                {
                    if (!node.IsLeaf)
                        break;

                    // Delete the leaf
                    var leaf = node.Leaf;
                    node.Leaf = null;

                    // Check if we should delete this node from the parent
                    if (parent != null && node.Edges.Count == 0)
                        parent.RemoveEdge(label);

                    // Check if we should merge this node
                    if (node != _root && node.Edges.Count == 1)
                        node.MergeChild();

                    // Check if we should merge the parent's other child
                    if (parent != null && parent != _root && parent.Edges.Count == 1 && !parent.IsLeaf)
                        parent.MergeChild();

                    return (leaf.Value, true);
                }

                // Look for an edge
                parent = node;
                label = search[0];
                if (!node.TryGetEdge(label, out node))
                    break;

                // Consume the search prefix
                if (search.StartsWith(node.Prefix))
                    search = search.Substring(node.Prefix.Length);
                else
                    break;
            }

            return (default(TValue), false);
        }

        /// <summary>
        /// Lookup a specific key.
        /// </summary>
        /// <returns>The value and if it was found</returns>
        public bool TryGetValue(string key, out TValue value) => _values.TryGetValue(key, out value);

        /// <summary>
        /// Search for the longest prefix match.
        /// </summary>
        public (string key, TValue value, bool found) LongestPrefix(string prefix)
        {
            LeafNode<TValue> last = null;
            var node = _root;
            var search = prefix;

            //for {
            while (true)
            {
                // Look for a leaf node
                if (node.IsLeaf)
                    last = node.Leaf;

                // Check for key exhaution
                if (search.Length == 0)
                    break;

                // Look for an edge
                if (!node.TryGetEdge(search[0], out node))
                    break;

                // Consume the search prefix
                if (search.StartsWith(node.Prefix))
                    search = search.Substring(node.Prefix.Length);
                else
                    break;
            }

            return last != null ? (last.Key, last.Value, true) : (string.Empty, default(TValue), false);
        }

        /// <summary>
        /// Walk the tree under a prefix
        /// </summary>
        private void WalkPrefix(string prefix, Walker walker)
        {
            var node = _root;
            var search = prefix;

            while (true)
            {
                // Check for key exhaution
                if (search.Length == 0)
                {
                    RecursiveWalk(node, walker);
                    return;
                }

                // Look for an edge
                if (!node.TryGetEdge(search[0], out node))
                    break;

                // Consume the search prefix
                if (search.StartsWith(node.Prefix))
                {
                    search = search.Substring(node.Prefix.Length);
                }
                else if (node.Prefix.StartsWith(search))
                {
                    RecursiveWalk(node, walker);
                    return;
                }
                else
                {
                    break;
                }
            }
        }

        /// <summary>
        /// Do a pre-order walk of a node recursively
        /// </summary>
        /// <returns>true if the walk should be aborted</returns>
        private static void RecursiveWalk(Node<TValue> node, Walker walker)
        {
            // Visit the leaf values if any
            if (node.Leaf != null)
            {
                walker(node.Leaf.Key, node.Leaf.Value);
            }

            // Recurse on the children
            foreach (var edge in node.Edges.Values)
            {
                RecursiveWalk(edge, walker);
            }
        }

        public Dictionary<string, TValue> ToDictionary() => new Dictionary<string, TValue>(_values);

        public List<(string key, TValue value)> ListPrefix(string prefix)
        {
            var result = new List<(string, TValue)>();
            WalkPrefix(prefix, (k, v) => result.Add((k, v)));
            return result;
        }

        public ICollection<string> Keys => _values.Keys;

        /// <summary>
        /// Find the length of the shared prefix of two strings
        /// </summary>
        /// <param name="str1">first string to compare</param>
        /// <param name="str2">secont string to compare</param>
        /// <returns>length of shared prefix</returns>
        private static int FindLongestPrefix(string str1, string str2)
        {
            var max = str1.Length > str2.Length ? str2.Length : str1.Length;

            for (var i = 0; i < max; i++)
                if (str1[i] != str2[i])
                    return i;

            return max;
        }
    }
}