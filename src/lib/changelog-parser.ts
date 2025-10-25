/**
 * Changelog Parser
 * Parses CHANGELOG.md and converts it to ChangelogEntry format
 */

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

/**
 * Parse changelog markdown content
 * Expected format:
 * ## [1.2.0] - 25 Oct 2025
 * ### Added
 * - Change 1
 * - Change 2
 */
export const parseChangelogMarkdown = (content: string): ChangelogEntry[] => {
  const entries: ChangelogEntry[] = [];
  const lines = content.split('\n');
  
  let currentVersion: string | null = null;
  let currentDate: string | null = null;
  let currentChanges: string[] = [];

  for (const line of lines) {
    // Match version header: ## [1.2.0] - 25 Oct 2025
    const versionMatch = line.match(/^##\s+\[(.+?)\]\s+-\s+(.+?)$/);
    if (versionMatch) {
      // Save previous entry if exists
      if (currentVersion && currentDate) {
        entries.push({
          version: currentVersion,
          date: convertDateToISO(currentDate),
          changes: currentChanges,
        });
      }
      
      currentVersion = versionMatch[1];
      currentDate = versionMatch[2];
      currentChanges = [];
      continue;
    }

    // Match bullet points: - Change description
    const changeMatch = line.match(/^-\s+(.+?)$/);
    if (changeMatch && currentVersion) {
      currentChanges.push(changeMatch[1]);
    }
  }

  // Save last entry
  if (currentVersion && currentDate) {
    entries.push({
      version: currentVersion,
      date: convertDateToISO(currentDate),
      changes: currentChanges,
    });
  }

  return entries;
};

/**
 * Convert date format from "25 Oct 2025" to "2025-10-25"
 */
const convertDateToISO = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toISOString().split('T')[0];
};
