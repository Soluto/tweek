using System;
using System.Linq;

namespace Engine.DataTypes
{
    public struct ConfigurationPath:
        IEquatable<ConfigurationPath>, IComparable<ConfigurationPath>,
        IEquatable<string>, IComparable<string>
    {
        public static ConfigurationPath FullScan = From("_");

        private readonly string _path;
        private readonly string[] _fragments;

        public ConfigurationPath(string path)
        {
            _path = path.ToLower();
            _fragments = _path.Split('/');
        }

        public static ConfigurationPath From(params string[] fragments)
        {
            string path  = string.Join("/", fragments).ToLower();
            return new ConfigurationPath(path);
        }

        public static ConfigurationPath New(string path)
        {
            return new ConfigurationPath(path);
        }

        public string Root
        {
            get
            {
                return _fragments.First();    
            }
        }

        public string Prefix
        {
            get
            {
                return string.Join("/", _fragments.Take(_fragments.Length - 1)); 
            }
        }

        public string Name
        {
            get { return _fragments.Last(); }
        }

        public bool IsScan
        {
            get { return Name == "_"; }
        }

        public override bool Equals(object obj)
        {
            var otherPath = obj as ConfigurationPath?;
            if (otherPath == null) return false;
            return Equals(otherPath);
        }

        public bool Equals(ConfigurationPath other)
        {
            return _path.Equals(other._path);
        }

        public int CompareTo(ConfigurationPath other)
        {
            return _path.CompareTo(other._path);
        }

        public bool Equals(string other)
        {
            return _path.Equals(new ConfigurationPath(other));
        }

        public int CompareTo(string other)
        {
            return _path.CompareTo(new ConfigurationPath(other));
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
            //broken, need to add support for nested relative path a/b/_/d/  with a/b/c/d/e should return e
            if (query == "" || query == FullScan) return this;

            if (!_path.StartsWith(query)) throw new Exception("path not under root");

            return From(_fragments.Skip(query._fragments.Length).ToArray());
        }

        public static bool Match(ConfigurationPath path, ConfigurationPath query)
        {
            if (query == FullScan) return true;
            if (query._fragments.Length == 1)
            {
                if (query.IsScan) return true;
                if (path._fragments.Length == 1) return query.Name == path.Name;
            }
            if (path._fragments.Length > 1)
            {
                return Match(From(path._fragments.Skip(1).ToArray()), From(query._fragments.Skip(1).ToArray()));
            }
            return false;
            
        }
    }
}