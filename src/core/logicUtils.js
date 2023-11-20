export const objectsAreEqual = (obj1, obj2) => {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
  
    if (keys1.length !== keys2.length) {
      return false; // If the objects have different numbers of properties, they are not equal
    }
  
    for (const key of keys1) {
      if (obj1[key] !== obj2[key]) {
        return false; // If any property values are different, the objects are not equal
      }
    }
  
    return true; // If no differences were found, the objects are equal
  }

export const objectArraysAreEqual = (arr1, arr2) => {
    if (arr1.length !== arr2.length) {
      return false; // If the lengths are different, the arrays are not equal
    }
  
    // Sort the arrays by a unique property to ensure the order doesn't affect the comparison
    const sortedArr1 = arr1.slice().sort((a, b) => a.id - b.id);
    const sortedArr2 = arr2.slice().sort((a, b) => a.id - b.id);
  
    for (let i = 0; i < sortedArr1.length; i++) {
      if (!objectsAreEqual(sortedArr1[i], sortedArr2[i])) {
        return false; // If any objects are not equal, the arrays are not equal
      }
    }
  
    return true; // If no differences were found, the arrays are equal
  }