import Git from "nodegit";
import rimraf from "rimraf";
import glob from "glob";

var promisify = (fn,context) => (...args)=> new Promise((resolve,reject)=> fn.call(context, ...args.concat([(err, res)=> !!(err) ? reject(err) : resolve(res)]))) 
var rimrafAsync = promisify(rimraf);
var globAsync = promisify(glob);

export function init({url, username, password}){
    var repoTask = rimrafAsync("./rulesRepo").then(()=>
    Git.Clone("http://tweek-gogs.07965c2a.svc.dockerapp.io/tweek/tweek-rules.git", "./rulesRepo", {
        fetchOpts: {
            callbacks:{
                credentials:()=>{
                    return Git.Cred.userpassPlaintextNew("tweek", "***REMOVED***");   
                }
            }
        }
    })).then(()=>console.log("clone success"), (ex)=> console.error(ex));
    
    return {
        async getAllFiles(){
            var rules = await globAsync("**/*.*", {cwd: process.cwd() + "/rulesRepo/rules"});
            return rules;
        }
    }
}