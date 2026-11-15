/**
 * Calculates estimated reading time for a given text.
 * Based on average human reading speed of 200 words per minute.
 * @param {string} text
 * @returns {string} e.g. "5 min read"
 */
export function calculateReadingTime(text) {
  if (!text || typeof text !== 'string') return '1 min read';
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}
