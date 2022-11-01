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

/**
 * Get date formatted i.e November 3rd 2019
 */
export const formatDate = (
  dateTime: number | Date = Date.now(),
  options?: Intl.DateTimeFormatOptions | null
): string => {
  if (!options) {
    options = {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "America/Chicago",
    };
  }
  return new Date(dateTime).toLocaleString("en-US", options);
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

export const daysDiff = (dt1: Date, dt2: Date) => {
  // calculate the time difference of two dates JavaScript
  var diffTime = dt2.getTime() - dt1.getTime();

  // calculate the number of days between two dates javascript
  var daysDiff = diffTime / (1000 * 3600 * 24);

  return Math.floor(daysDiff);
};

export const datesAreOnSameDay = (date1: Date, date2: Date) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};
