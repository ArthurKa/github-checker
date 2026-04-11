import { z } from 'zod/v4';
import { customRepoId, customRepoName } from '../customs';

export const Repo = (
  z
    .object({
      id: customRepoId,
      full_name: customRepoName,
    })
    .transform(({ full_name, ...rest }) => ({
      ...rest,
      repoName: full_name,
    }))
);
export type Repo = z.infer<typeof Repo>;
