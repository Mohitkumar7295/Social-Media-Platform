import React, { useMemo, useEffect } from 'react';
import DOMPurify from 'dompurify';

export default function ArticleRenderer({ content = '', onHeadingsExtracted }) {
  // Process and sanitize HTML, generating stable IDs for headings
  const { sanitizedHtml, extractedHeadings } = useMemo(() => {
    if (!content) {
      return { sanitizedHtml: '<p><i>No content.</i></p>', extractedHeadings: [] };
    }

    // 1. Sanitize raw HTML with DOMPurify
    const clean = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [
        'p', 'h1', 'h2', 'h3', 'h4', 'strong', 'em', 'u', 's', 'a',
        'ul', 'ol', 'li', 'blockquote', 'hr', 'img', 'pre', 'code', 'br',
      ],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel', 'class', 'id'],
    });

    // 2. Parse into temporary DOM node to inject IDs and collect headings
    const parser = new DOMParser();
    const doc = parser.parseFromString(clean, 'text/html');
    const headingElements = doc.querySelectorAll('h1, h2, h3');
    const headings = [];

    headingElements.forEach((el, index) => {
      const text = el.textContent?.trim() || `Section ${index + 1}`;
      const level = parseInt(el.tagName.replace('H', ''), 10);
      const generatedId = `heading-${index + 1}-${text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .slice(0, 40)}`;

      el.setAttribute('id', generatedId);
      headings.push({
        id: generatedId,
        text,
        level,
      });
    });

    return {
      sanitizedHtml: doc.body.innerHTML,
      extractedHeadings: headings,
    };
  }, [content]);

  // Report headings back to parent TableOfContents
  useEffect(() => {
    if (onHeadingsExtracted) {
      onHeadingsExtracted(extractedHeadings);
    }
  }, [extractedHeadings, onHeadingsExtracted]);

  return (
    <article
      className="prose max-w-none font-serif text-lg sm:text-[19px] leading-[1.8] sm:leading-[1.85] text-[#292524] selection:bg-[#E9F8F5] selection:text-[#0F8178]
        prose-headings:font-serif prose-headings:font-bold prose-headings:text-[#201F1D] prose-headings:tracking-tight
        prose-h1:text-3xl sm:prose-h1:text-4xl prose-h1:mt-12 prose-h1:mb-4
        prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:mt-10 prose-h2:mb-3
        prose-h3:text-xl sm:prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-2
        prose-p:mb-6 prose-p:text-[#292524]
        prose-blockquote:border-l-4 prose-blockquote:border-[#0F8178] prose-blockquote:pl-5 prose-blockquote:italic prose-blockquote:text-[#555555] prose-blockquote:my-8
        prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-6 prose-ul:space-y-2
        prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-6 prose-ol:space-y-2
        prose-li:text-[#292524]
        prose-a:text-[#0F8178] prose-a:underline prose-a:underline-offset-4 hover:prose-a:text-[#086B64]
        prose-hr:border-[#E8EAE8] prose-hr:my-10
        prose-img:rounded-2xl prose-img:border prose-img:border-[#E8EAE8] prose-img:my-8 prose-img:mx-auto prose-img:shadow-md"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
