import R from 'ramda';

class StatelessMutator {
  constructor(getMutator, onMutation) {
    this.getMutator = getMutator;
    this.onMutation = onMutation;
  }

  in = (innerPath) => new StatelessMutator(() => this.getMutator().in(innerPath), this.onMutation);

  up = () => new StatelessMutator(() => this.getMutator().up(), this.onMutation);

  apply = (mutation) => {
    const mutated = mutation(this.getMutator());
    this.onMutation(mutated.target);
    return new StatelessMutator(() => this.getMutator().setPath(mutated.path), this.onMutation);
  }

  get path() { return this.getMutator().path;}

  _liftMutation = (mutationFactory) => this::((...params) => this.apply((mutator) => mutationFactory(mutator)(...params)))

  get updateValue() {return this._liftMutation(m => m.updateValue);}

  get updateKey() {return this._liftMutation(m => m.updateKey);}

  get replaceKeys() {return this._liftMutation(m => m.replaceKeys);}

  get delete() {return this._liftMutation(m => m.replaceKeys);}

  get insert() {return this._liftMutation(m => m.insert);}
}

class Mutator {

  constructor(target, path = []) {
    this.target = target;
    this.path = path;
  }

  setPath = (path) => new Mutator(this.target, path);

  in = (innerPath) => this.setPath([...this.path, innerPath]);

  up = () => this.setPath(R.splitAt(-1, this.path)[0]);

  updateValue = newValue => {
    const [innerPath, [key]] = R.splitAt(-1, this.path);
    const container = R.reduce((acc, x) => acc[x], this.target, innerPath);
    container[key] = newValue;
    return new Mutator(this.target, this.path);
  }
  updateKey = newKey => {
    const [innerPath, [key]] = R.splitAt(-1, this.path);
    if (newKey === key) return this;
    const container = R.reduce((acc, x) => acc[x], this.target, innerPath);
    const newProps = R.toPairs(container).map(([k, v]) => [k === key ? newKey : k, v]);

    for (const k of Object.keys(container)) {delete container[k];}
    for (const [k, v] of newProps) {container[k] = v;}

    return new Mutator(this.target, [...innerPath, newKey]);
  }

  replaceKeys = (key1, key2) => {
    const treeContainer = R.reduce((acc, x) => acc[x], this.target, this.path);
    [treeContainer[key1], treeContainer[key2]] = [treeContainer[key2], treeContainer[key1]];
    return new Mutator(treeContainer, this.path);
  }

  delete = () => {
    const [innerPath, [key]] = R.splitAt(-1, this.path);
    const container = R.reduce((acc, x) => acc[x], this.target, innerPath);
    delete container[key];
    return new Mutator(this.target, innerPath);
  }

  insert = (key, value) => {
    R.reduce((acc, x) => acc[x], this.target, this.path)[key] = value;
    return new Mutator(this.target, this.path);
  }
}

Mutator.stateless = (getTarget, onMutation) =>
  new StatelessMutator(() => new Mutator(R.clone(getTarget())), onMutation);

export default Mutator;
