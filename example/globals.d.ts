// Add global vars here

// Make sure TS is aware of imports for Webpack modules that aren't TS files (e.g. images)
// https://www.typescriptlang.org/docs/handbook/modules.html#wildcard-module-declarations
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';

type InterfaceOf<T> = { [P in keyof T]: T[P] }
type POJO = { [key: string]: any };
