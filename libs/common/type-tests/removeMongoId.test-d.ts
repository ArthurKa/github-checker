import { expectType } from 'tsd';
import { WithId } from 'mongodb';
import { removeMongoId } from '../src/utils/removeMongoId';

declare const test1: WithId<{ a: number }>;
expectType<{ a: number }>(removeMongoId(test1));

declare const test2: WithId<{ b: string }> | null;
expectType<{ b: string } | null>(removeMongoId(test2));
