import { getEventData } from './get-event-data';
import semver from 'semver';
import type { Arguments } from './types';

export const getTags = async ({ version }: Pick<Arguments, 'version'>): Promise<string[]> => {
  const eventData = await getEventData();

  const versionTag = semver.valid(version || eventData.release?.tag_name);
  if (!versionTag) throw new Error('Invalid version');

  const tags = [versionTag];

  if (process.env.GITHUB_EVENT_NAME === 'release') {
    if (!eventData.release?.draft && !eventData.release?.prerelease) {
      const major = semver.major(versionTag).toString();
      const minor = semver.minor(versionTag).toString();
      tags.push(major, `${major}.${minor}`);
    }
  }

  return tags;
};
