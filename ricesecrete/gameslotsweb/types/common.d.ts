type DeletKey<T, Keys extends keyof T> = {
  [K in keyof T] : K extends Keys ? never : T[K];
};