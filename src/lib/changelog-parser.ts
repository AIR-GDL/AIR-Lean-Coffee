/**
 * Changelog Parser
 * Parses CHANGELOG.md and converts it to ChangelogEntry format
 */

export interface ChangelogSection {
  title: string;
  items: string[];
}

export interface ChangelogEntry {
  version: string;
  date: string;
  sections: ChangelogSection[];
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
  let currentSections: ChangelogSection[] = [];
  let currentSectionTitle = '';
  let currentItems: string[] = [];

  const pushCurrentSection = () => {
    if (currentItems.length > 0 || currentSectionTitle) {
      currentSections.push({
        title: currentSectionTitle,
        items: currentItems,
      });
    }
    currentSectionTitle = '';
    currentItems = [];
  };

  for (const line of lines) {
    // Match version header: ## [1.2.0] - 25 Oct 2025
    const versionMatch = line.match(/^##\s+\[(.+?)\]\s+-\s+(.+?)$/);
    if (versionMatch) {
      pushCurrentSection();
      if (currentVersion && currentDate) {
        entries.push({
          version: currentVersion,
          date: convertDateToISO(currentDate),
          sections: currentSections,
        });
      }
      
      currentVersion = versionMatch[1];
      currentDate = versionMatch[2];
      currentSections = [];
      currentSectionTitle = '';
      currentItems = [];
      continue;
    }

    // Match section header: ### Added, ### 🎨 UI/UX Improvements
    const sectionMatch = line.match(/^###\s+(.+?)$/);
    if (sectionMatch && currentVersion) {
      pushCurrentSection();
      currentSectionTitle = sectionMatch[1];
      continue;
    }

    // Match bullet points: - Change description or  - Sub-item
    const changeMatch = line.match(/^-\s+(.+?)$/);
    if (changeMatch && currentVersion) {
      currentItems.push(changeMatch[1]);
      continue;
    }

    // Match sub-items:   - Sub-item description
    const subItemMatch = line.match(/^\s+-\s+(.+?)$/);
    if (subItemMatch && currentVersion) {
      currentItems.push('  ' + subItemMatch[1]);
    }
  }

  // Save last section and entry
  pushCurrentSection();
  if (currentVersion && currentDate) {
    entries.push({
      version: currentVersion,
      date: convertDateToISO(currentDate),
      sections: currentSections,
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
