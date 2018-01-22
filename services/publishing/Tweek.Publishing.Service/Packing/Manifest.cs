using Newtonsoft.Json.Linq;
using static LanguageExt.Prelude;

namespace Tweek.Publishing.Service.Packing
{
  public static class ManifestExtensions{
      public static string[] GetDependencies(this Manifest manifest) =>
          match(manifest.implementation.type,
            with("alias", (_)=> new[]{manifest.implementation.key}),
            (_)=> manifest.dependencies
            );
      
  }

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