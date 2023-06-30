import type { Octokit } from '@octokit/rest';
import { glob } from 'glob';
import fs from 'node:fs';
import { join } from 'node:path';

import type { Arguments, TreePart } from './types';

const templates: Record<string, string[]> = {
  'composite-action': ['action.{yml,yaml}', 'LICENSE'],
  'javascript-action': ['action.{yml,yaml}', 'dist/**', 'LICENSE'],
};

const extractNames = (input: string) =>
  input
    .split('\n')
    .map(name => {
      const trimmed = name.trim();
      if (trimmed.endsWith('/')) return trimmed + '**';
      return trimmed;
    })
    .filter(name => name);

const getIncludePatterns = ({ template, include }: Pick<Arguments, 'include' | 'template'>) => {
  if (template) {
    if (!templates[template]) throw new Error(`'${template}' is not a valid template`);
    return templates[template];
  }

  const list = extractNames(include);

  if (list.length) return list;
  return ['**/*'];
};

const getExcludePatterns = async (exclude: string) => {
  if (exclude) {
    return extractNames(exclude);
  }

  if (!fs.existsSync('.gvrignore')) return [];

  const ignoreFile = await fs.promises.readFile('.gvrignore', 'utf8');
  return extractNames(ignoreFile);
};

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
