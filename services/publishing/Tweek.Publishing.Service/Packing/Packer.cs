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
        public async Task<Dictionary<string,KeyDef>> Pack( Dictionary<string, Func<Task<string>>> source ){
             return new Dictionary<string, KeyDef>(await source.ToObservable().Where(x=> Regex.IsMatch(x.Key, "^manifests/.*\\.json$"))
                   .Select(x => Observable.FromAsync(async ()=>{
                       try {
                            return JsonConvert.DeserializeObject<Manifest>(await x.Value());
                       } catch (Exception ex){
                           ex.Data["key"] = x.Key;
                           throw;
                       }
                   }))
                   .Concat()
                   .Select(manifest => Observable.FromAsync(async () => {
                       var keyDef = new KeyDef(){
                           format = manifest.implementation.format ?? manifest.implementation.type,
                           dependencies = manifest.dependencies
                       };
                       
                       switch (manifest.implementation.type){
                           case "file":
                               keyDef.payload = await source[$"implementations/{manifest.implementation.format}/{manifest.key_path}.{manifest.implementation.extension ?? manifest.implementation.format}"]();
                               break;
                           case "const":
                               keyDef.payload = JsonConvert.SerializeObject(manifest.implementation.value);
                               break;
                           case "alias":
                               keyDef.payload = manifest.implementation.key;
                               keyDef.dependencies = new string[]{manifest.implementation.key};
                               break;
                       }
                       return (keyPath:manifest.key_path, keyDef: keyDef);
                   }))
                   .Concat()
                   .ToDictionary(x=>x.keyPath, x=>x.keyDef));
                   

        }
    }
}