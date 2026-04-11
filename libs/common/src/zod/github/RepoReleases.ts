import { z } from 'zod/v4';
import { customReleaseTag } from '../customs';

export const RepoReleases = z.array(
  z
    .object({
      tag_name: customReleaseTag,
      html_url: z.url(),
    })
    .transform(({ tag_name, html_url }) => ({
      tag: tag_name,
      htmlUrl: html_url,
    })),
);
export type RepoReleases = z.infer<typeof RepoReleases>;
