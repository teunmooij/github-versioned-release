import fs from 'node:fs';

import type { Arguments } from './types';

const basicFilePatterns = ['LICENSE{,.md,.txt}', 'README{,.md,.txt}', 'CHANGELOG{,.md,.txt}'];

const templates: Record<string, string[]> = {
  'composite-action': ['action.{yml,yaml}', ...basicFilePatterns],
  'javascript-action': ['action.{yml,yaml}', 'dist/**', ...basicFilePatterns],
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

export const getIncludePatterns = ({ template, include }: Pick<Arguments, 'include' | 'template'>) => {
  const list = [];

  if (template) {
    if (!templates[template]) throw new Error(`'${template}' is not a valid template`);
    list.push(...templates[template]);
  }

  if (include) {
    list.push(...extractNames(include));
  }


  if (list.length) return list;
  return ['**/*'];
};

export const getExcludePatterns = async (exclude: string) => {
  if (exclude) {
    return extractNames(exclude);
  }

  if (!fs.existsSync('.gvrignore')) return [];

  const ignoreFile = await fs.promises.readFile('.gvrignore', 'utf8');
  return extractNames(ignoreFile);
};
