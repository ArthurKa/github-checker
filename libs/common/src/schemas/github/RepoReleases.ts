import { z } from 'zod/v4';
import { customReleaseTag } from '../customs';

export const RepoReleases = z.array(
  z.object({
    tag_name: customReleaseTag,
    html_url: z.url(),
  }),
);
export type RepoReleases = z.infer<typeof RepoReleases>;
