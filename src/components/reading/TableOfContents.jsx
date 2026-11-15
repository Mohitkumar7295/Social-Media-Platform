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
      <div className="lg:hidden mb-8 bg-[#141416] border border-[#242428] rounded-2xl overflow-hidden shadow-sm">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-full flex items-center justify-between p-4 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
        >
          <div className="flex items-center gap-2">
            <AlignLeft className="w-4 h-4 text-[#FF6719]" />
            <span>Table of Contents ({headings.length} sections)</span>
          </div>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isOpen && (
          <nav className="p-4 pt-1 border-t border-[#222226] flex flex-col gap-2">
            {headings.map((heading) => (
              <a
                key={heading.id}
                href={`#${heading.id}`}
                onClick={(e) => handleScrollTo(e, heading.id)}
                className={`text-xs py-1 transition-colors ${
                  heading.level === 3 ? 'pl-4' : heading.level === 2 ? 'pl-2' : ''
                } ${
                  activeId === heading.id
                    ? 'text-[#FF6719] font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
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
    <div className="hidden lg:flex flex-col gap-3 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto p-4 bg-[#141416] border border-[#242428] rounded-2xl shadow-sm w-64 select-none">
      <div className="flex items-center gap-2 pb-2.5 border-b border-[#222226]">
        <AlignLeft className="w-4 h-4 text-[#FF6719]" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 font-sans">
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
                  ? 'bg-orange-500/10 text-[#FF6719] font-semibold pl-2.5 border-l-2 border-[#FF6719]'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1a20]'
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
