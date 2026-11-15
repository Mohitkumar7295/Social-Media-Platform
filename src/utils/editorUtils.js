/**
 * Utility functions for article editing, slug generation, and reading time calculation.
 */

/**
 * Generate a clean, URL-friendly slug from an article title.
 * Appends a short 4-character random suffix to ensure uniqueness.
 * @param {string} title - The article title
 * @param {boolean} addSuffix - Whether to append a short unique hash
 * @returns {string} Clean slug
 */
export function generateSlug(title, addSuffix = true) {
  if (!title || typeof title !== 'string') {
    return `story-${Math.random().toString(36).substring(2, 8)}`;
  }

  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove non-alphanumeric except spaces and hyphens
    .replace(/[\s_-]+/g, '-') // collapse whitespace and underscores to hyphens
    .replace(/^-+|-+$/g, '') // trim leading and trailing hyphens
    .slice(0, 80); // max 80 chars base

  if (!addSuffix) {
    return base || 'story';
  }

  const suffix = Math.random().toString(36).substring(2, 6);
  return `${base || 'story'}-${suffix}`;
}

/**
 * Estimate reading time in minutes based on content text.
 * Average reading speed: ~200 words per minute.
 * @param {string} content - HTML or plain text content
 * @returns {number} Estimated minutes (minimum 1)
 */
export function estimateReadingTime(content) {
  if (!content) return 1;

  // Strip HTML tags
  const plainText = content.replace(/<[^>]*>/g, ' ');
  const words = plainText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  return Math.max(1, Math.ceil(wordCount / 200));
}

/**
 * Extract a clean excerpt from HTML content.
 * @param {string} content - HTML content
 * @param {number} maxLength - Maximum character length (default 180)
 * @returns {string} Plain text excerpt
 */
export function extractExcerpt(content, maxLength = 180) {
  if (!content) return '';

  const plainText = content
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (plainText.length <= maxLength) return plainText;

  return plainText.slice(0, maxLength).trim() + '...';
}
