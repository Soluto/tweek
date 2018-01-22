using System;
using System.Collections.Generic;
using System.Linq;
using System.Reactive.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
using System.Text.RegularExpressions;

namespace Tweek.Publishing.Service.Packing
{
    public class Packer
    {
        public async Task<Dictionary<string,KeyDef>> Pack( Dictionary<string, Func<string>> source ){
             return new Dictionary<string, KeyDef>(source.Where(x=> Regex.IsMatch(x.Key, "^manifests/.*\\.json$"))
                   .Select(x =>{
                       try {
                            return JsonConvert.DeserializeObject<Manifest>(x.Value());
                       } catch (Exception ex){
                           ex.Data["key"] = x.Key;
                           throw;
                       }
                   })
                   .Select(manifest => {
                       var keyDef = new KeyDef(){
                           format = manifest.implementation.format ?? manifest.implementation.type,
                           dependencies = manifest.GetDependencies()
                       };
                       
                       switch (manifest.implementation.type){
                           case "file":
                               keyDef.payload = source[$"implementations/{manifest.implementation.format}/{manifest.key_path}.{manifest.implementation.extension ?? manifest.implementation.format}"]();
                               break;
                           case "const":
                               keyDef.payload = JsonConvert.SerializeObject(manifest.implementation.value);
                               break;
                           case "alias":
                               keyDef.payload = manifest.implementation.key;
                               break;
                       }
                       return (keyPath:manifest.key_path, keyDef: keyDef);
                   })
                   .ToDictionary(x=>x.keyPath, x=>x.keyDef));
                   

        }
    }
}