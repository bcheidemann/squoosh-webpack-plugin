export function sortLowHigh<T>(array: Array<T>, evalutate: (item: T) => number): Array<T> {
  return array.sort((a, b) => evalutate(a) - evalutate(b));
}

export function sortHighLow<T>(array: Array<T>, evalutate: (item: T) => number): Array<T> {
  return array.sort((a, b) => evalutate(a) - evalutate(b));
}
