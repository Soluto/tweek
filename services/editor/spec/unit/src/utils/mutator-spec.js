/* global jest, beforeEach, describe, it, expect */
jest.unmock('../../../../src/utils/mutator');

import Mutator from '../../../../src/utils/mutator';

describe('mutator tests', () => {
  let newMutator = (fn) => {
    let target = {};
    let mutator = new Mutator(target);
    return () => fn(target, mutator);
  };

  describe('traversal', () => {
    it(
      'in should allow navigating in object',
      newMutator((target, mutator) => {
        target.prop1 = { prop2: 10 };
        expect(mutator.in('prop1').getValue().prop2).toEqual(10);
        expect(
          mutator
            .in('prop1')
            .in('prop2')
            .getValue(),
        ).toEqual(10);
      }),
    );

    it(
      'up should allow navigating in object',
      newMutator((target, mutator) => {
        target.prop1 = { prop2: 10 };
        expect(
          mutator
            .in('prop1')
            .in('prop2')
            .up()
            .getValue().prop2,
        ).toEqual(10);
      }),
    );

    it(
      'in & up shoul work with arrays',
      newMutator((target, mutator) => {
        target.propArray = [5, 10];
        expect(
          mutator
            .in('propArray')
            .in(1)
            .getValue(),
        ).toEqual(10);
        expect(
          mutator
            .in('propArray')
            .in(1)
            .up()
            .getValue()[1],
        ).toEqual(10);
      }),
    );
  });

  describe('insert', () => {
    it(
      'should add a field to object',
      newMutator((target, mutator) => {
        mutator.insert('myField', 10);
        expect(target.myField).toEqual(10);
      }),
    );

    it(
      'should be able to add a nested field',
      newMutator((target, mutator) => {
        mutator
          .insert('someField', {})
          .in('someField')
          .insert('nested', 10);
        expect(target.someField.nested).toEqual(10);
      }),
    );

    it(
      'should be able to add item to an array at index',
      newMutator((target, mutator) => {
        mutator
          .insert('someFieldArray', [])
          .in('someFieldArray')
          .insert(0, 5)
          .insert(1, 10);
        expect(target.someFieldArray[0]).toEqual(5);
        expect(target.someFieldArray[1]).toEqual(10);
      }),
    );
  });

  describe('delete', () => {
    it(
      'should be able to delete an item',
      newMutator((target, mutator) => {
        target.someKey = 5;
        mutator.in('someKey').delete();
        expect(target.someKey).toEqual(undefined);
      }),
    );

    it(
      'should be able to delete nested item',
      newMutator((target, mutator) => {
        target.someKey = { a: 10 };
        expect(Object.keys(target.someKey).length).toEqual(1);
        mutator
          .in('someKey')
          .in('a')
          .delete();
        expect(Object.keys(target.someKey).length).toEqual(0);
      }),
    );

    it(
      'should be able to delete an item from array',
      newMutator((target, mutator) => {
        target.someKey = [0, 1, 2];
        mutator
          .in('someKey')
          .in(1)
          .delete();
        expect(target.someKey).toEqual([0, 2]);
      }),
    );
  });

  describe('update value', () => {
    it(
      'should be able to update a field value',
      newMutator((target, mutator) => {
        target.someKey = 5;
        mutator.in('someKey').updateValue(10);
        expect(target.someKey).toEqual(10);
      }),
    );

    it(
      'should be able to update a value in array',
      newMutator((target, mutator) => {
        target.someArray = [10, 20];
        mutator
          .in('someArray')
          .in(1)
          .updateValue(30);
        expect(target.someArray[1]).toEqual(30);
      }),
    );
  });

  describe('adjust value', () => {
    it(
      'should be able to adjust a field value',
      newMutator((target, mutator) => {
        target.someKey = 5;
        mutator.in('someKey').adjustValue(x => x + 5);
        expect(target.someKey).toEqual(10);
      }),
    );

    it(
      'should be able to adjust a value in array',
      newMutator((target, mutator) => {
        target.someArray = [10, 20];
        mutator
          .in('someArray')
          .in(1)
          .adjustValue(x => x + 10);
        expect(target.someArray[1]).toEqual(30);
      }),
    );
  });

  describe('update key', () => {
    it(
      'should be able to update a key',
      newMutator((target, mutator) => {
        target.someKey = 5;
        mutator.in('someKey').updateKey('newKey');
        expect(target.someKey).toEqual(undefined);
        expect(target.newKey).toEqual(5);
      }),
    );
    it(
      'should update the mutator path after key is updated',
      newMutator((target, mutator) => {
        target.someKey = 5;
        mutator
          .in('someKey')
          .updateKey('newKey')
          .updateValue(10);
        expect(target.newKey).toEqual(10);
      }),
    );
    it(
      'should preserve order in object',
      newMutator((target, mutator) => {
        target.largeObj = { a: 5, b: 10, c: 30, d: 40 };
        mutator
          .in('largeObj')
          .in('c')
          .updateKey('e');
        expect(Object.keys(target.largeObj)).toEqual(['a', 'b', 'e', 'd']);
      }),
    );
  });

  describe('prepend', () => {
    it(
      'should be able to insert item to the start of an array',
      newMutator((target, mutator) => {
        target.someProp = [2, 3, 4];
        mutator.in('someProp').prepend(1);
        expect(target.someProp).toEqual([1, 2, 3, 4]);
      }),
    );
  });

  describe('append', () => {
    it(
      'should be able to insert item to the end of an array',
      newMutator((target, mutator) => {
        target.someProp = [1, 2, 3];
        mutator.in('someProp').append(4);
        expect(target.someProp).toEqual([1, 2, 3, 4]);
      }),
    );
  });

  describe('replace keys', () => {
    it(
      'should be able replace two field values',
      newMutator((target, mutator) => {
        target.someKey = 5;
        target.otherKey = 10;
        mutator.replaceKeys('someKey', 'otherKey');
        expect(target.someKey).toEqual(10);
        expect(target.otherKey).toEqual(5);
      }),
    );
    it(
      'should work on arrays',
      newMutator((target, mutator) => {
        target.myArray = [5, 10, 15];
        mutator.in('myArray').replaceKeys(0, '2');
        expect(target.myArray).toEqual([15, 10, 5]);
      }),
    );
  });

  describe('stateless mutator', () => {
    it('should send a mutation event with updated value', () => {
      let target = { a: 5 };
      let mock = jest.fn();
      let mutator = Mutator.stateless(() => target, mock);
      mutator.in('a').updateValue(10);
      expect(mock.mock.calls.length).toEqual(1);
      expect(mock.mock.calls[0][0].a).toEqual(10);
    });

    it('should not change the orignal target', () => {
      let target = { a: 5 };
      let mock = jest.fn();
      let mutator = Mutator.stateless(() => target, mock);
      mutator.in('a').updateValue(10);
      expect(mock.mock.calls[0][0].a).toEqual(10);
      expect(target.a).toEqual(5);
    });

    it('apply should call method onMutation event only once per transcation', () => {
      let target = { a: 1, b: 1 };
      let mock = jest.fn();
      let mutator = Mutator.stateless(() => target, mock);
      mutator.in('a').updateValue(1);
      mutator.in('b').updateValue(1);
      expect(mock.mock.calls.length).toEqual(2);
      mutator.apply(m =>
        m
          .in('a')
          .updateValue(2)
          .up()
          .in('b')
          .updateValue(2),
      );
      expect(mock.mock.calls.length).toEqual(3);
      const applyMutation = mock.mock.calls[2][0];
      expect(applyMutation.a).toEqual(2);
      expect(applyMutation.b).toEqual(2);
    });
  });
});
