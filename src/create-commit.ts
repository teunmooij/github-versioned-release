import type { Octokit } from '@octokit/rest';
import { glob } from 'glob';
import fs from 'node:fs';
import { join } from 'node:path';

import type { Arguments, TreePart } from './types';

const extractNames = (input: string) =>
  input
    .split('\n')
    .map(name => name.trim())
    .filter(name => name);

const getIncludePatterns = (include: string) => {
  const list = extractNames(include);

  if (list.length) return list;
  return ['**/*'];
};

const getExcludePatterns = async (exclude: string) => {
  if (exclude) {
    return extractNames(exclude);
  }

  if (!fs.existsSync('.ghignore')) return [];

  const ignoreFile = await fs.promises.readFile('.ghignore', 'utf8');
  return extractNames(ignoreFile);
};

export const createCommit = async ({ include, exclude, version }: Arguments, octokit: Octokit): Promise<string> => {
  // Determine which files to include
  const files = await glob(getIncludePatterns(include), {
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
