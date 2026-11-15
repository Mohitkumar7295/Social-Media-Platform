/**
 * Converts a title string into a URL-friendly slug.
 * @param {string} text
 * @returns {string} e.g. "how-to-build-modern-web-apps"
 */
export function slugify(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-'); // Replace multiple - with single -
}
