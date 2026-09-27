let currentTags: string[] = [];

/**
 * Store tags passed via the --tag option
 */
export function setTags(tags: string[]): void {
  currentTags = tags;
}

/**
 * Get stored tags passed via the --tag option
 */
export function getTags(): string[] {
  return currentTags;
}
