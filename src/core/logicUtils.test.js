import { objectsAreEqual, objectArraysAreEqual } from './logicUtils';

test('objectsAreEqual returns true for equal objects', () => {
  const obj1 = { name: 'John', age: 30 };
  const obj2 = { name: 'John', age: 30 };
  expect(objectsAreEqual(obj1, obj2)).toBe(true);
});

test('objectsAreEqual returns false for objects with different properties', () => {
  const obj1 = { name: 'John', age: 30 };
  const obj2 = { name: 'John', age: 30, city: 'New York' };
  expect(objectsAreEqual(obj1, obj2)).toBe(false);
});

test('objectsAreEqual returns false for objects with different property values', () => {
  const obj1 = { name: 'John', age: 30 };
  const obj2 = { name: 'John', age: 40 };
  expect(objectsAreEqual(obj1, obj2)).toBe(false);
});

test('objectsAreEqual returns false for objects with different number of properties', () => {
  const obj1 = { name: 'John', age: 30 };
  const obj2 = { name: 'John' };
  expect(objectsAreEqual(obj1, obj2)).toBe(false);
});

test('objectArraysAreEqual returns true for equal arrays of objects', () => {
  const arr1 = [
    { id: 1, name: 'John', age: 30 },
    { id: 2, name: 'Jane', age: 25 },
    { id: 3, name: 'Bob', age: 40 }
  ];
  const arr2 = [
    { id: 1, name: 'John', age: 30 },
    { id: 2, name: 'Jane', age: 25 },
    { id: 3, name: 'Bob', age: 40 }
  ];
  expect(objectArraysAreEqual(arr1, arr2)).toBe(true);
});

test('objectArraysAreEqual returns false for arrays with different lengths', () => {
  const arr1 = [
    { id: 1, name: 'John', age: 30 },
    { id: 2, name: 'Jane', age: 25 },
    { id: 3, name: 'Bob', age: 40 }
  ];
  const arr2 = [
    { id: 1, name: 'John', age: 30 },
    { id: 2, name: 'Jane', age: 25 }
  ];
  expect(objectArraysAreEqual(arr1, arr2)).toBe(false);
});

test('objectArraysAreEqual returns false for arrays with different objects', () => {
  const arr1 = [
    { id: 1, name: 'John', age: 30 },
    { id: 2, name: 'Jane', age: 25 },
    { id: 3, name: 'Bob', age: 40 }
  ];
  const arr2 = [
    { id: 1, name: 'John', age: 30 },
    { id: 2, name: 'Jane', age: 35 },
    { id: 3, name: 'Bob', age: 40 }
  ];
  expect(objectArraysAreEqual(arr1, arr2)).toBe(false);
});