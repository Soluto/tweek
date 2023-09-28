using System.Collections.Generic;

namespace Tweek.Engine.Collections
{
    internal class Node<TValue>
    {
        /// <summary>
        /// Used to store possible leaf
        /// </summary>
        internal LeafNode<TValue> Leaf;

        /// <summary>
        /// The common prefix we ignore
        /// </summary>
        internal string Prefix = string.Empty;

        /// <summary>
        /// Edges should be stored in-order for iteration.
        /// We avoid a fully materialized slice to save memory,
        /// since in most cases we expect to be sparse
        /// </summary>
        internal SortedList<char, Node<TValue>> Edges = new SortedList<char, Node<TValue>>();

        public bool IsLeaf => Leaf != null;

        public void AddEdge(char label, Node<TValue> node)
        {
            Edges.Add(label, node);
        }

        public void SetEdge(char label, Node<TValue> node)
        {
            Edges[label] = node;
        }

        public bool TryGetEdge(char label, out Node<TValue> edge)
        {
            return Edges.TryGetValue(label, out edge);
        }

        public void RemoveEdge(char label)
        {
            Edges.Remove(label);
        }

        public void MergeChild()
        {
            var child = Edges.Values[0];

            Prefix = Prefix + child.Prefix;
            Leaf = child.Leaf;
            Edges = child.Edges;
        }

        public void Clear()
        {
            Leaf = null;
            Prefix = string.Empty;
            Edges.Clear();
        }
    }
}