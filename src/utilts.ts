export const randFromArray = <T>(arr: T[]): T => {
  // "~~" for a closest "int"
  return arr[~~(arr.length * Math.random())];
};

export const shuffleArray = <T>(arr: T[]): T[] => {
  for (var i = arr.length - 1; i > 0; i--) {
    // Generate random number
    var j = Math.floor(Math.random() * (i + 1));

    var temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }

  return arr;
};

export const splitAt = (i: number, arr: any[]) => {
  const clonedArray = [...arr];
  return [clonedArray.splice(0, i), clonedArray];
};

export const innerConcat = (arr1: any[], arr2: any[]) => {
  return [...arr1, ...arr2].map((el, index) => {
    const arrToGet = index % 2 === 0 ? arr1 : arr2;
    const correctIndex = Math.floor(index / 2);
    return arrToGet[correctIndex];
  });
};
