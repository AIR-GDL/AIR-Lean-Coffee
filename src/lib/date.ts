/**
 * Date formatting utilities
 */

/**
 * Format date from YYYY-MM-DD to "DD Mon YYYY" format
 * Example: "2025-10-23" -> "23 Oct 2025"
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString + 'T00:00:00Z');
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  };
  return date.toLocaleDateString('en-US', options);
};
