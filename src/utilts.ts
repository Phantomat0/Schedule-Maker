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
