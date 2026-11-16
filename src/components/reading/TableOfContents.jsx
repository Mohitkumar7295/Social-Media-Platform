import React, { useState, useEffect } from 'react';
import { List, ChevronDown, ChevronUp, AlignLeft } from 'lucide-react';

export default function TableOfContents({ headings = [], activeId = '', isMobile = false }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!headings || headings.length === 0) {
    return null;
  }

  const handleScrollTo = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const topOffset = 80; // Account for fixed navbar
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - topOffset,
        behavior: 'smooth',
      });
      setIsOpen(false);
    }
  };

  // Mobile Collapsible Variant
  if (isMobile) {
    return (
      <div className="lg:hidden mb-8 bg-white border border-[#E8EAE8] rounded-2xl overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-full flex items-center justify-between p-4 text-xs font-semibold text-[#201F1D] hover:bg-[#F0FAF8] transition-colors"
        >
          <div className="flex items-center gap-2">
            <AlignLeft className="w-4 h-4 text-[#0F8178]" />
            <span>Table of Contents ({headings.length} sections)</span>
          </div>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isOpen && (
          <nav className="p-4 pt-1 border-t border-[#E8EAE8] flex flex-col gap-2">
            {headings.map((heading) => (
              <a
                key={heading.id}
                href={`#${heading.id}`}
                onClick={(e) => handleScrollTo(e, heading.id)}
                className={`text-xs py-1 transition-colors ${
                  heading.level === 3 ? 'pl-4' : heading.level === 2 ? 'pl-2' : ''
                } ${
                  activeId === heading.id
                    ? 'text-[#0F8178] font-semibold'
                    : 'text-[#777777] hover:text-[#201F1D]'
                }`}
              >
                {heading.text}
              </a>
            ))}
          </nav>
        )}
      </div>
    );
  }

  // Desktop Sticky Sidebar Variant
  return (
    <div className="hidden lg:flex flex-col gap-3 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto p-4 bg-white border border-[#E8EAE8] rounded-2xl shadow-xs w-64 select-none">
      <div className="flex items-center gap-2 pb-2.5 border-b border-[#E8EAE8]">
        <AlignLeft className="w-4 h-4 text-[#0F8178]" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#201F1D] font-sans">
          Table of Contents
        </h4>
      </div>

      <nav className="flex flex-col gap-1.5 overflow-y-auto pr-1">
        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          return (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              onClick={(e) => handleScrollTo(e, heading.id)}
              className={`text-xs py-1 px-2 rounded-lg transition-all duration-150 truncate ${
                heading.level === 3 ? 'ml-3' : heading.level === 2 ? 'ml-1.5' : ''
              } ${
                isActive
                  ? 'bg-[#E9F8F5] text-[#0F8178] font-semibold pl-2.5 border-l-2 border-[#0F8178]'
                  : 'text-[#777777] hover:text-[#201F1D] hover:bg-[#F0FAF8]'
              }`}
              title={heading.text}
            >
              {heading.text}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
