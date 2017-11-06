import * as R from 'ramda';

class StatelessMutator {
  constructor(getMutator, onMutation) {
    this.getMutator = getMutator;
    this.onMutation = onMutation;
  }

  in = innerPath => new StatelessMutator(() => this.getMutator().in(innerPath), this.onMutation);

  up = () => new StatelessMutator(() => this.getMutator().up(), this.onMutation);

  apply = (mutation) => {
    const mutated = mutation(this.getMutator());
    this.onMutation(mutated.target);
  };

  get path() {
    return this.getMutator().path;
  }
  get target() {
    return this.getMutator().target;
  }
  get getValue() {
    return this.getMutator().getValue;
  }

  _liftMutation = mutationFactory => (...params) =>
    this.apply(mutator => mutationFactory(mutator)(...params));

  get updateValue() {
    return this._liftMutation(m => m.updateValue);
  }

  get updateKey() {
    return this._liftMutation(m => m.updateKey);
  }

  get replaceKeys() {
    return this._liftMutation(m => m.replaceKeys);
  }

  get delete() {
    return this._liftMutation(m => m.delete);
  }

  get insert() {
    return this._liftMutation(m => m.insert);
  }

  get prepend() {
    return this._liftMutation(m => m.prepend);
  }

  get append() {
    return this._liftMutation(m => m.append);
  }
}

class Mutator {
  constructor(target, path = []) {
    this.target = target;
    this.path = path;
  }

  static stateless = (getTarget, onMutation) =>
    new StatelessMutator(() => new Mutator(R.clone(getTarget())), onMutation);

  getValue = () => R.reduce((acc, x) => acc[x], this.target, this.path);

  setPath = path => new Mutator(this.target, path);

  in = innerPath => this.setPath([...this.path, innerPath.toString()]);

  up = () => this.setPath(R.splitAt(-1, this.path)[0]);

  updateValue = (newValue) => {
    const [innerPath, [key]] = R.splitAt(-1, this.path);
    const container = R.reduce((acc, x) => acc[x], this.target, innerPath);
    container[key] = newValue;
    return new Mutator(this.target, this.path);
  };

  updateKey = (newKey) => {
    const [innerPath, [key]] = R.splitAt(-1, this.path);
    if (newKey === key) return this;
    const container = R.reduce((acc, x) => acc[x], this.target, innerPath);
    const newProps = R.toPairs(container).map(([k, v]) => [k === key ? newKey : k, v]);

    for (const k of Object.keys(container)) {
      delete container[k];
    }
    for (const [k, v] of newProps) {
      container[k] = v;
    }

    return new Mutator(this.target, [...innerPath, newKey]);
  };

  prepend = (value) => {
    const container = R.reduce((acc, x) => acc[x], this.target, this.path);
    container.unshift(value);
    return new Mutator(this.target, this.path);
  };

  append = (value) => {
    const container = R.reduce((acc, x) => acc[x], this.target, this.path);
    container.push(value);
    return new Mutator(this.target, this.path);
  };

  replaceKeys = (key1, key2) => {
    const container = R.reduce((acc, x) => acc[x], this.target, this.path);
    [container[key1], container[key2]] = [container[key2], container[key1]];
    return new Mutator(this.target, this.path);
  };

  delete = () => {
    const [innerPath, [key]] = R.splitAt(-1, this.path);
    const container = R.reduce((acc, x) => acc[x], this.target, innerPath);
    if (Array.isArray(container)) {
      container.splice(parseInt(key, 10), 1);
    } else {
      delete container[key];
    }
    return new Mutator(this.target, R.slice(0, -1, this.path));
  };

  insert = (key, value) => {
    R.reduce((acc, x) => acc[x], this.target, this.path)[key] = value;
    return new Mutator(this.target, this.path);
  };
}

export default Mutator;
