using System;
using System.Collections.Generic;
using System.Linq;
using System.Reactive.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace Tweek.Publishing.Service.Packing
{
    public class Packer
    {
        public async Task<Dictionary<string,KeyDef>> Pack( Dictionary<string, Func<Task<string>>> source ){
             return new Dictionary<string, KeyDef>(await source.ToObservable().Where(x=>x.Key.StartsWith("manifests/"))
                   .SelectMany(async x => JsonConvert.DeserializeObject<Manifest>(await x.Value()))
                   .SelectMany(async manifest => {
                       var keyDef = new KeyDef(){
                           format = manifest.implemenation.format ?? manifest.implemenation.type,
                           dependencies = manifest.dependencies
                       };
                       
                       switch (manifest.implemenation.type){
                           case "file":
                               keyDef.payload = await source[$"implementations/{manifest.implemenation.format}/{manifest.key_path}.{manifest.implemenation.extension ?? manifest.implemenation.format}"]();
                               break;
                           case "const":
                               keyDef.payload = manifest.implemenation.value;
                               break;
                           case "alias":
                               keyDef.payload = manifest.implemenation.key;
                               keyDef.dependencies = new string[]{manifest.implemenation.key};
                               break;
                       }
                       return (keyPath:manifest.key_path, keyDef: keyDef);
                   })
                   .ToDictionary(x=>x.keyPath, x=>x.keyDef));
                   

        }
    }
}