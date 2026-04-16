import { ObjEntries, ObjFromEntries } from '@arthurka/ts-utils';

export const docTags = ObjFromEntries(
  ObjEntries({
    subscription: 'Subscription management operations',
    health: 'Health check endpoints',
  } satisfies Record<string, string>).map(([name, description]) => [name, {
    name,
    description,
  }] as const),
);
