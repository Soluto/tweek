import R from "ramda";

export default class Mutator{
    constructor(sourceTree, callback, path=[]){
        this._sourceTree = sourceTree;
        this._callback = callback;
        this.path = path;
    }
    
    in = (innerPath)=> new Mutator(this._sourceTree, this._callback, [...this.path, innerPath]);
    
    getValue = ()=>{
            var [innerPath, key] = R.splitAt(-1,this.path);
            return R.reduce((acc,x)=>acc[x], this.sourceTree, innerPath)[key];
        };
        
    updateValue = (newValue) =>{
            console.log(`updating value:${this.path} to ${newValue}`);
            var clonedTree = R.clone(this._sourceTree);
            var [innerPath, [key]] = R.splitAt(-1,this.path);
            R.reduce((acc,x)=>acc[x], clonedTree, innerPath)[key] = newValue;
            console.log(clonedTree);
            this._callback(clonedTree);
            return new Mutator(clonedTree, this._callback, this.path);
        }
     updateKey = (newKey) =>{
            console.log(`updating key:${this.path} to ${newKey}`);
            var [innerPath, [container, key]] = R.splitAt(-2,this.path);
            if (newKey === key) return this;
            var clonedTree = R.clone(this._sourceTree);
            var root = R.reduce((acc,x)=>acc[x], clonedTree, innerPath);
            root[container] = R.fromPairs(R.toPairs(root[container]).map(([k,v])=>[k === key ? newKey : k, v]));
            this._callback(clonedTree);
            return new Mutator(clonedTree, this._callback, [...innerPath, container, newKey]);
        }
}
