/**
 * SEO & Dynamic Metadata Utility
 * Updates document title, meta tags, and Open Graph attributes for client-side rendered views.
 */
export function updateArticleSEO(post) {
  if (!post) {
    document.title = 'WriteSpace – Social Publishing Platform';
    return;
  }

  // 1. Title
  const siteName = 'WriteSpace';
  const pageTitle = post.title ? `${post.title} — ${siteName}` : siteName;
  document.title = pageTitle;

  // 2. Helper to set or update meta tag by name or property
  function setMetaTag(selectorKey, selectorVal, content) {
    if (!content) return;
    let element = document.querySelector(`meta[${selectorKey}="${selectorVal}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(selectorKey, selectorVal);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  }

  // Helper to set link canonical
  function setCanonical(url) {
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  const articleUrl = window.location.href;
  const description = post.excerpt || post.subtitle || 'Read this story on WriteSpace.';
  const authorName = post.author?.full_name || 'Writer';

  // Standard Meta
  setMetaTag('name', 'description', description);
  setMetaTag('name', 'author', authorName);
  setCanonical(articleUrl);

  // Open Graph
  setMetaTag('property', 'og:site_name', siteName);
  setMetaTag('property', 'og:type', 'article');
  setMetaTag('property', 'og:title', post.title);
  setMetaTag('property', 'og:description', description);
  setMetaTag('property', 'og:url', articleUrl);

  if (post.cover_image_url) {
    setMetaTag('property', 'og:image', post.cover_image_url);
    setMetaTag('name', 'twitter:image', post.cover_image_url);
    setMetaTag('name', 'twitter:card', 'summary_large_image');
  } else {
    setMetaTag('name', 'twitter:card', 'summary');
  }

  if (post.published_at) {
    setMetaTag('property', 'article:published_time', post.published_at);
  }
  if (post.category) {
    setMetaTag('property', 'article:section', post.category);
  }

  // Twitter Card
  setMetaTag('name', 'twitter:title', post.title);
  setMetaTag('name', 'twitter:description', description);
}

/**
 * Reset SEO metadata to defaults when leaving article reading view.
 */
export function resetSEO() {
  document.title = 'WriteSpace – Editorial & Social Publishing Platform';
}
