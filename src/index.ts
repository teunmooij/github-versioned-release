import * as core from '@actions/core';
import { Octokit } from '@octokit/rest';

import { run } from './action';
import { Arguments } from './types';

if (!process.env.GITHUB_WORKSPACE) throw new Error('Please checkout your repository first (see README)');
if (!process.env.GITHUB_TOKEN) throw new Error('GITHUB_TOKEN not defined');
if(!process.env.GITHUB_REPOSITORY) throw new Error('GITHUB_REPOSITORY not defined');

const args: Arguments = {
  version: core.getInput('version'),
  include: core.getInput('include'),
  exclude: core.getInput('exclude'),
};

const token = process.env.GITHUB_TOKEN;
const octokit = new Octokit({ auth: `token ${token}` });


run(args, octokit).then(sha => core.setOutput('sha', sha));
