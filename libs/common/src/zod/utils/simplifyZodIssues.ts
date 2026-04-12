import { z } from 'zod/v4';
import { SimplifiedZodIssues } from '../common';

export const simplifyZodIssues = (e: z.core.$ZodIssue[]): SimplifiedZodIssues => (
  e.map((e): SimplifiedZodIssues[number] => ({
    code: e.code,
    path: e.path.map(e => e.toString()),
    message: e.message,
  }))
);
