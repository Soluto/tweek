using Newtonsoft.Json.Linq;

namespace Tweek.Publishing.Service.Packing
{
  public class Manifest{
        public class Implementation {
            public string format;
            public string type;
            public string extension;
            public JToken value; 
            public string key;
        }
        public string[] dependencies;
        public Implementation implementation;
        public  string key_path;
    }
}