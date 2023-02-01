// Add global vars here

/**
 * Make sure TS is aware of imports for Webpack modules that aren't TS files (e.g. images)
 * - TS docs: https://www.typescriptlang.org/docs/handbook/modules.html#wildcard-module-declarations
 * - Webpack docs: https://webpack.js.org/guides/typescript/#importing-other-assets
 */
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';

type InterfaceOf<T> = { [P in keyof T]: T[P] }
type POJO = { [key: string]: any };
