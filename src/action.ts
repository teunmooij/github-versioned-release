import type { Octokit } from '@octokit/rest';
import { createCommit } from './create-commit';
import { createRef } from './create-ref';
import { getTags } from './get-tags';
import type { Arguments } from './types';

export const run = async (args: Arguments, octokit: Octokit): Promise<string> => {
  const tags = await getTags(args);

  const sha = await createCommit(args, octokit);

  for (const tag of tags) {
    await createRef(tag, sha, octokit);
  }

  return sha;
};
