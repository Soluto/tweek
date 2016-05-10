import Git from 'nodegit'
import rimraf from 'rimraf'
import glob from 'glob'

const promisify = (fn,context) => (...args)=> new Promise((resolve,reject)=> fn.call(context, ...args.concat([ (err, res)=> !!(err) ? reject(err) : resolve(res) ]))) 
const rimrafAsync = promisify(rimraf)
const globAsync = promisify(glob)

export function init({ url = 'http://tweek-gogs.07965c2a.svc.dockerapp.io/tweek/tweek-rules.git'
                     , username = 'tweek',
                      password='po09!@QW' }) {
  rimrafAsync('./rulesRepo').then(()=>
    Git.Clone(url, './rulesRepo', {
      fetchOpts: {
        callbacks:{
          credentials:()=>{
            return Git.Cred.userpassPlaintextNew(username, password)   
          }
        }
      }
    })).then(()=>console.log('clone success'), (ex)=> console.error(ex))
    
  return {
    async getAllFiles() {
      let rules = await globAsync('**/*.*', { cwd: process.cwd() + '/rulesRepo/rules' })
      return rules
    }
  }
}
