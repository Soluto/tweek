import R from 'ramda';

export default class Mutator {
  constructor(sourceTree, callback, path = []) {
    this._sourceTree = { _: sourceTree };
    this._callback = ({ _ }) => callback(_);
    this.path = ['_', ...path];
  }

  in = (innerPath) => new Mutator(this._sourceTree, this._callback, [...this.path, innerPath]);

  up = () => new Mutator(this._sourceTree, this._callback, R.splitAt(-1, this.path)[0]);

  getValue = () => R.reduce((acc, x) => acc[x], this._sourceTree, this.path);

  updateValue = newValue => {
    console.log(`updating value:${this.path} to ${newValue}`);
    let clonedTree = R.clone(this._sourceTree);
    let [innerPath, [key]] = R.splitAt(-1, this.path);
    let container = R.reduce((acc, x) => acc[x], clonedTree, innerPath);
    container[key] = newValue;
    this._callback(clonedTree);
    return new Mutator(clonedTree, this._callback, this.path);
  }
  updateKey = newKey => {
    console.log(`updating key:${this.path} to ${newKey}`);
    let [innerPath, [container, key]] = R.splitAt(-2, this.path);
    if (newKey === key) return this;
    let clonedTree = R.clone(this._sourceTree);
    let root = R.reduce((acc, x) => acc[x], clonedTree, innerPath);
    root[container] = R.fromPairs(R.toPairs(root[container]).map(([k, v]) => [k === key ? newKey : k, v]));
    this._callback(clonedTree);
    return new Mutator(clonedTree, this._callback, [...innerPath, container, newKey]);
  }

  replaceKeys = (key1, key2) => {
    console.log(`replacing key:${key1} with ${key2} on ${this.path}`);
    let clonedTree = R.clone(this._sourceTree);
    let treeContainer = R.reduce((acc, x) => acc[x], this._sourceTree, this.path);
    let clonedContainer = R.reduce((acc, x) => acc[x], clonedTree, this.path);
    clonedContainer[key1] = treeContainer[key2];
    clonedContainer[key2] = treeContainer[key1];
    this._callback(clonedTree);
    return new Mutator(clonedTree, this._callback, this.path);
  }

  delete = () => {
    console.log(`deleting key:${this.path}`);
    let [innerPath, [key]] = R.splitAt(-1, this.path);
    let clonedTree = R.clone(this._sourceTree);
    let container = R.reduce((acc, x) => acc[x], clonedTree, innerPath);
    delete container[key];
    this._callback(clonedTree);
    return new Mutator(clonedTree, this._callback, innerPath);
  }

  insert = (key, value) => {
    console.log(`inserting key:${this.path} ${key}:${value}`);
    let clonedTree = R.clone(this._sourceTree);
    R.reduce((acc, x) => acc[x], clonedTree, this.path)[key] = value;
    this._callback(clonedTree);
    return new Mutator(clonedTree, this._callback, this.path);
  }
}
