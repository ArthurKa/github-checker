import { z } from 'zod/v4';
import { customRepoId, customRepoName } from '../customs';

export const Repo = z.object({
  id: customRepoId,
  full_name: customRepoName,
});
export type Repo = z.infer<typeof Repo>;
