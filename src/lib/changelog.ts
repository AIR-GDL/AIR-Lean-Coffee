import path from 'path';
import { readFile } from 'fs/promises';
import { parseChangelogMarkdown, ChangelogEntry } from './changelog-parser';
import { APP_VERSION } from './version';

export const loadChangelog = async (): Promise<ChangelogEntry[]> => {
  const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
  const fileContents = await readFile(changelogPath, 'utf-8');
  return parseChangelogMarkdown(fileContents);
};

export const getLatestVersion = async (): Promise<string> => {
  const entries = await loadChangelog();
  return entries[0]?.version ?? APP_VERSION;
};
