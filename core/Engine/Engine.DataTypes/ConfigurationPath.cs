using System;

namespace Engine.DataTypes
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
            Location = IsScan ? _path.Substring(0, _path.Length - 1) : _path;
        }

        public static ConfigurationPath From(params string[] fragments)
        {
            return new ConfigurationPath(string.Join("/", fragments));
        }

        public static ConfigurationPath New(string path)
        {
            return new ConfigurationPath(path);
        }

        public string Location { get; }

        public string Name { get; }

        public bool IsScan { get; }

        public override bool Equals(object obj)
        {
            var otherPath = obj as ConfigurationPath?;
            return otherPath != null && Equals(otherPath);
        }

        public bool Equals(ConfigurationPath other)
        {
            return Equals(other._path);
        }

        public int CompareTo(ConfigurationPath other)
        {
            return CompareTo(other._path);
        }

        public bool Equals(string other)
        {
            return _path.Equals(other);
        }

        public int CompareTo(string other)
        {
            return string.Compare(_path, other, StringComparison.Ordinal);
        }

        public override int GetHashCode()
        {
            return _path.GetHashCode();
        }

        public override string ToString()
        {
            return _path;
        }

        public static implicit operator string(ConfigurationPath path)
        {
            return path.ToString();
        }

        public static implicit operator ConfigurationPath(string path)
        {
            return new ConfigurationPath(path);
        }

        public static bool operator ==(ConfigurationPath p1, ConfigurationPath p2)
        {
            return p1.Equals(p2);
        }

        public static bool operator !=(ConfigurationPath p1, ConfigurationPath p2)
        {
            return !p1.Equals(p2);
        }

        public ConfigurationPath ToRelative(ConfigurationPath query)
        {
            if (!query.Contains(this)) throw new Exception($"{this} is not in: {query}");

            return New(_path.Substring(query.Location.Length));
        }

        public bool Contains(ConfigurationPath other)
        {
            if (_path.Equals(other._path)) return true;

            return IsScan && other._path.StartsWith(Location);
        }
    }
}
