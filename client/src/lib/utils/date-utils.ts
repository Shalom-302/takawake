/**
 * Utilities for date formatting and manipulation
 */

/**
 * Formats a date as a relative time string (e.g., "2 hours ago", "yesterday")
 * @param date The date to format
 * @returns A human-readable string representing the relative time
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // Less than a minute
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  // Less than an hour
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  
  // Less than a day
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  
  // Less than a week
  if (diffInSeconds < 604800) {
    // Special case for yesterday
    if (diffInSeconds < 172800) {
      return 'yesterday';
    }
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  
  // Less than a month
  if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  }
  
  // More than a month - format as date
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return date.toLocaleDateString(undefined, options);
}

/**
 * Formats a date or timestamp to a standard date-time format
 * @param dateOrTimestamp Date object or timestamp
 * @returns Formatted date string
 */
export function formatDateTime(dateOrTimestamp: Date | string | number): string {
  const date = typeof dateOrTimestamp === 'object' 
    ? dateOrTimestamp 
    : new Date(dateOrTimestamp);
    
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return date.toLocaleDateString(undefined, options);
}

/**
 * Gets a short formatted time (HH:MM)
 * @param date The date to format
 * @returns The formatted time string
 */
export function getTimeString(date: Date): string {
  return date.toLocaleTimeString(undefined, { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
}
