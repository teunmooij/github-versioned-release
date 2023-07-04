import type { Octokit } from '@octokit/rest';
import { glob } from 'glob';
import fs from 'node:fs';
import { join } from 'node:path';

import type { Arguments, TreePart } from './types';
import { getExcludePatterns, getIncludePatterns } from './glob-patterns';

export const createCommit = async ({ template, include, exclude, version }: Arguments, octokit: Octokit): Promise<string> => {
  // Determine which files to include
  const files = await glob(getIncludePatterns({ template, include }), {
    ignore: await getExcludePatterns(exclude),
    nodir: true,
    cwd: process.env.GITHUB_WORKSPACE,
  });

  // Create the commit
  const [owner, repo] = process.env.GITHUB_REPOSITORY!.split('/');

  const treePromises = files.map(
    async (path: string): Promise<TreePart> => ({
      path,
      mode: '100644',
      type: 'blob',
      content: await fs.promises.readFile(join(process.env.GITHUB_WORKSPACE!, path), 'utf8'),
    }),
  );

  const tree = await octokit.git.createTree({
    owner,
    repo,
    tree: await Promise.all(treePromises),
  });

  const commit = await octokit.git.createCommit({
    owner,
    repo,
    message: `Release ${version}`,
    tree: tree.data.sha,
    parents: [process.env.GITHUB_SHA!],
  });

  return commit.data.sha;
};
