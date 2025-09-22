/**
 * Safely formats a timestamp to locale time string
 * Handles both Date objects and date strings/numbers
 */
export function safeToLocaleTimeString(timestamp: Date | string | number | undefined | null): string {
  if (!timestamp) {
    return 'Unknown time';
  }

  try {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleTimeString();
  } catch (error) {
    console.warn('Error formatting timestamp:', error);
    return 'Unknown time';
  }
}

/**
 * Safely formats a timestamp to locale date string
 * Handles both Date objects and date strings/numbers
 */
export function safeToLocaleDateString(timestamp: Date | string | number | undefined | null): string {
  if (!timestamp) {
    return 'Unknown date';
  }

  try {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleDateString();
  } catch (error) {
    console.warn('Error formatting timestamp:', error);
    return 'Unknown date';
  }
}

/**
 * Safely formats a timestamp to locale date and time string
 * Handles both Date objects and date strings/numbers
 */
export function safeToLocaleString(timestamp: Date | string | number | undefined | null): string {
  if (!timestamp) {
    return 'Unknown';
  }

  try {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleString();
  } catch (error) {
    console.warn('Error formatting timestamp:', error);
    return 'Unknown';
  }
}