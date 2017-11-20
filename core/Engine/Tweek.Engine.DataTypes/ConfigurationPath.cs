using System;

namespace Tweek.Engine.DataTypes
{
    public struct ConfigurationPath :
        IEquatable<ConfigurationPath>, IComparable<ConfigurationPath>,
        IEquatable<string>, IComparable<string>
    {
        public const string SCAN = "_";
        public static readonly ConfigurationPath FullScan = New(SCAN);

        private readonly string _path;

        public ConfigurationPath(string path)
        {
            _path = string.Join("/", path.Split(new[] { '/' }, StringSplitOptions.RemoveEmptyEntries)).ToLower();
            var nameStart = _path.LastIndexOf('/');
            Name = _path.Substring(nameStart + 1);
            IsScan = Name.Equals(SCAN);
            Folder = _path.Substring(0, _path.Length - 1).Trim('/');
        }

        public static ConfigurationPath From(params string[] fragments) => new ConfigurationPath(string.Join("/", fragments));

        public static ConfigurationPath New(string path) => new ConfigurationPath(path);

        public string Folder { get; }

        public string Name { get; }

        public bool IsScan { get; }

        public bool IsHidden() => _path.Contains("@");
        
        public bool IsHidden(string prefix) => _path.IndexOf("@", prefix.Length, StringComparison.Ordinal) >= 0;
        
        public override bool Equals(object obj)
        {
            var otherPath = obj as ConfigurationPath?;
            return otherPath != null && Equals(otherPath);
        }

        public bool Equals(ConfigurationPath other) => Equals(other._path);

        public int CompareTo(ConfigurationPath other) => CompareTo(other._path);

        public bool Equals(string other) => _path.Equals(other);

        public int CompareTo(string other) => string.Compare(_path, other, StringComparison.Ordinal);

        public override int GetHashCode() => _path.GetHashCode();

        public override string ToString() => _path;

        public static implicit operator string(ConfigurationPath path) => path.ToString();

        public static implicit operator ConfigurationPath(string path) => new ConfigurationPath(path);

        public static bool operator ==(ConfigurationPath p1, ConfigurationPath p2) => p1.Equals(p2);

        public static bool operator !=(ConfigurationPath p1, ConfigurationPath p2) => !p1.Equals(p2);

        public ConfigurationPath ToRelative(ConfigurationPath query)
        {
            if (!query.Contains(this)) throw new Exception($"{this} is not in: {query}");

            return New(_path.Substring(query.Folder.Length));
        }

        public bool Contains(ConfigurationPath other)
        {
            if (_path == SCAN || _path.Equals(other._path)) return true;
            return IsScan && other._path.StartsWith($"{Folder}/");
        }
    }
}
