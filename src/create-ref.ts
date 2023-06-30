import type { Octokit } from '@octokit/rest';

export const createRef = async (tag: string, sha: string, octokit: Octokit) => {
  const [owner, repo] = process.env.GITHUB_REPOSITORY!.split('/');
  const ref = `tags/v${tag}`;

  const { data: matchingRefs } = await octokit.git.listMatchingRefs({
    owner,
    repo,
    ref: ref,
  });

  const matchingRef = matchingRefs.find(refObj => {
    return refObj.ref.endsWith(ref);
  });

  if (matchingRef !== undefined) {
    await octokit.git.updateRef({
      owner,
      repo,
      force: true,
      ref: ref,
      sha,
    });
  } else {
    await octokit.git.createRef({
      owner,
      repo,
      ref: `refs/${ref}`,
      sha,
    });
  }
};
