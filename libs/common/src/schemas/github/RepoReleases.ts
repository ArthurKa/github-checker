import { z } from 'zod/v4';
import { customReleaseTag, customStringURL } from '../customs';

export const RepoReleases = z.array(
  z.object({
    tag_name: customReleaseTag,
    html_url: customStringURL,
  }),
);
export type RepoReleases = z.infer<typeof RepoReleases>;
