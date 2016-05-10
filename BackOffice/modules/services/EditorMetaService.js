import R from "ramda"
import {types, defaultValue, description} from "./MetaHelpers";

export default class EditorMetaService{
    
    _meta = {};
    
    async init(){
        this.meta = {
            identities:{
                "device":{}
            },
            fields:{
               "device":{
                    "PartnerBrandId": defaultValue("AsurionFriends")
                                      (description("The name of the partner")
                                      (types.String)),
                    "DeviceOsType": defaultValue("Android")(types.Enum("Android","IOs")),
                    "AgentOsVersion": types.Version,
                    "AgentVersion": defaultValue("1.0.0.0")(types.Version),
                    "DeviceOsVersion": types.Version,
                    "IsInGroup": defaultValue(false)(types.Bool),
                }
            }
        } 
    }
    
    getFieldMeta(field){
        if (field==="") return types.Empty;
        var [identity, property] = field.split(".");
        return this.meta.fields[identity][property];
    }
    
    getKeyMeta(key){
        
    }
    
    getSuggestions({type, query}){
        if (type==="MatcherProperty"){
            var {input} = query;
            return R.reduce(R.concat, []) 
                (R.keys(this.meta.identities).map(identity=> R.toPairs(this.meta.fields[identity]).map(([field,meta]) => ({label:`${field}`, value:`${identity}.${field}` ,meta })))
            );
        }
        else {
            return [];
        }
    }
    
}
