import type { Endpoints } from '@octokit/types';

export interface Arguments {
  version: string;
  template: string;
  include: string;
  exclude: string;
}

export type Tree = Omit<
  Endpoints['POST /repos/{owner}/{repo}/git/trees']['parameters'],
  'baseUrl' | 'headers' | 'mediaType'
>['tree'];

export type TreePart = Tree extends Array<infer E> ? E : never;

export interface EventData {
  release?: {
    tag_name?: string;
    draft?: boolean;
    prerelease?: boolean;
  };
}
