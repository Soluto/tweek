import { clone } from 'ramda';

type Index = string | number | symbol;
type InnerProp<T, Path extends Index[]> = Path extends []
  ? T
  : Path extends [infer Prop, ...infer Rest]
  ? Prop extends keyof T
    ? Rest extends Index[]
      ? InnerProp<T[Prop], Rest>
      : never
    : never
  : never;

type Up<Path extends Index[]> = Path extends [...infer Rest, unknown] ? Rest : never[];
type ChangeLast<Path extends Index[], Last> = Path extends [...infer Rest, infer Prop]
  ? Prop extends Last
    ? Path
    : [...Rest, Last]
  : never[];
type ArrayValue<Arr> = Arr extends Array<infer Item> ? Item : never;

class StatelessMutator<T, Path extends Index[]> {
  constructor(
    readonly getMutator: () => Mutator<T, Path>,
    readonly onMutation: (value: T) => void,
  ) {}

  get path() {
    return this.getMutator().path;
  }

  get target() {
    return this.getMutator().target;
  }

  get getValue() {
    return this.getMutator().getValue;
  }

  get updateValue() {
    return this._liftMutation((m) => m.updateValue);
  }

  get adjustValue() {
    return this._liftMutation((m) => m.adjustValue);
  }

  get updateKey() {
    return this._liftMutation((m) => m.updateKey);
  }

  get replaceKeys() {
    return this._liftMutation((m) => m.replaceKeys);
  }

  get delete() {
    return this._liftMutation((m) => m.delete);
  }

  get insert() {
    return this._liftMutation((m) => m.insert);
  }

  get prepend() {
    return this._liftMutation((m) => m.prepend);
  }

  get append() {
    return this._liftMutation((m) => m.append);
  }

  in = <P extends keyof InnerProp<T, Path>>(innerPath: P): StatelessMutator<T, [...Path, P]> =>
    new StatelessMutator(() => this.getMutator().in(innerPath), this.onMutation);

  up = (): StatelessMutator<T, Up<Path>> =>
    new StatelessMutator(() => this.getMutator().up(), this.onMutation);

  apply = (mutation: (m: Mutator<T, Path>) => Mutator<T, Path>) => {
    const mutated = mutation(this.getMutator());
    this.onMutation(mutated.target);
  };

  _liftMutation = <Fn extends (...args: any[]) => any>(
    mutationFactory: (m: Mutator<T, Path>) => Fn,
  ) => (...params: Parameters<Fn>) => this.apply((mutator) => mutationFactory(mutator)(...params));
}

class Mutator<T, Path extends Index[] = []> {
  constructor(readonly target: T, readonly path: Path = ([] as string[]) as Path) {}

  static stateless = <T>(getTarget: () => T, onMutation: (value: T) => void) =>
    new StatelessMutator(() => new Mutator(clone(getTarget())), onMutation);

  getValue = (): InnerProp<T, Path> => this.path.reduce((acc, x) => acc[x], this.target as any);

  setPath = <P extends Index[]>(path: P) => new Mutator(this.target, path);

  in = <P extends keyof InnerProp<T, Path>>(innerPath: P) =>
    this.setPath([...this.path, innerPath.toString()] as [...Path, P]);

  up = () => this.setPath(this.path.slice(0, -1) as Up<Path>);

  updateValue = (newValue: InnerProp<T, Path>) => {
    const innerPath = this.path.slice(0, -1);
    const key = this.path[this.path.length - 1];
    const container = innerPath.reduce((acc: any, x) => acc[x], this.target);
    container[key] = newValue;
    return new Mutator(this.target, this.path);
  };

  adjustValue = (mapFn: (value: InnerProp<T, Path>) => InnerProp<T, Path>) => {
    const innerPath = this.path.slice(0, -1);
    const key = this.path[this.path.length - 1];
    const container = innerPath.reduce((acc: any, x) => acc[x], this.target);
    container[key] = mapFn(this.getValue());
    return new Mutator(this.target, this.path);
  };

  updateKey = <P extends keyof InnerProp<T, Up<Path>>>(
    newKey: P,
  ): Mutator<T, ChangeLast<Path, P>> => {
    const innerPath = this.path.slice(0, -1);
    const key = this.path[this.path.length - 1];
    if (newKey === key) {
      return this as any;
    }

    const container = innerPath.reduce((acc: any, x) => acc[x], this.target);
    const newProps = Object.entries(container).map(
      ([k, v]) => [k === key ? newKey : k, v] as const,
    );

    for (const k of Object.keys(container)) {
      delete container[k];
    }
    for (const [k, v] of newProps) {
      container[k] = v;
    }

    return new Mutator(this.target, [...innerPath, newKey] as ChangeLast<Path, P>);
  };

  prepend = (value: ArrayValue<InnerProp<T, Path>>) => {
    const container = this.getValue() as any[];
    container.unshift(value);
    return new Mutator(this.target, this.path);
  };

  append = (value: ArrayValue<InnerProp<T, Path>>) => {
    const container = this.getValue() as any[];
    container.push(value);
    return new Mutator(this.target, this.path);
  };

  replaceKeys = (key1: keyof InnerProp<T, Path>, key2: keyof InnerProp<T, Path>) => {
    const container = this.getValue();
    [container[key1], container[key2]] = [container[key2], container[key1]];
    return new Mutator(this.target, this.path);
  };

  delete = (): Mutator<T, Up<Path>> => {
    const innerPath = this.path.slice(0, -1) as Up<Path>;
    const key = this.path[this.path.length - 1];
    const container = innerPath.reduce((acc: any, x) => acc[x], this.target);
    if (Array.isArray(container)) {
      container.splice(Number(key), 1);
    } else {
      delete container[key];
    }
    return new Mutator(this.target, innerPath);
  };

  insert = <P extends keyof InnerProp<T, Path>>(key: P, value: InnerProp<T, Path>[P]) => {
    const container = this.getValue();
    container[key] = value;
    return new Mutator(this.target, this.path);
  };
}

export default Mutator;
