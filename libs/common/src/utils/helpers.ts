import { v4 } from 'uuid';
import { UUID } from '../brands/string/UUID';

export function castTo<T = never>(e: [T] extends [never] ? never : unknown): asserts e is typeof e & T {}

export type SafeOmit<T, U extends keyof T> = Omit<T, U>;
export type StrictExtract<T, U extends T> = Extract<T, U>;
export type StrictExclude<T, U extends T> = Exclude<T, U>;
export type DistributivePick<T, K extends keyof T> = T extends T ? Pick<T, K> : never;
export type DistributiveSafeOmit<T, U extends keyof T> = T extends T ? SafeOmit<T, U> : never;

export const generateUUID = () => UUID(v4());

export const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
