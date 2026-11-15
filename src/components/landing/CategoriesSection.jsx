import React, { useState } from 'react';
import {
  Cpu,
  Code2,
  Sparkles,
  TrendingUp,
  GraduationCap,
  Coffee,
  Target,
  Atom,
  ArrowRight,
  Check,
} from 'lucide-react';
import { CATEGORIES } from '../../data/categories';

export default function CategoriesSection({ onSelectCategory }) {
  const [activeCategory, setActiveCategory] = useState(null);

  const iconMap = {
    Cpu,
    Code2,
    Sparkles,
    TrendingUp,
    GraduationCap,
    Coffee,
    Target,
    Atom,
  };

  const handleCategoryClick = (category) => {
    setActiveCategory(category.slug === activeCategory ? null : category.slug);
    if (onSelectCategory) {
      onSelectCategory(category);
    }
  };

  return (
    <section id="categories" className="py-20 sm:py-28 bg-canvas-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
            Curated Knowledge
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
            Explore Popular Topics
          </h2>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            Follow the subjects you care about most. Discover essays, perspectives, and tutorials from experienced writers across domains.
          </p>
        </div>

        {/* Categories Grid (8 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {CATEGORIES.map((cat) => {
            const Icon = iconMap[cat.icon] || Sparkles;
            const isSelected = activeCategory === cat.slug;

            return (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat)}
                className={`group p-6 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-brand-50/70 border-brand-600 shadow-md ring-2 ring-brand-600/20'
                    : 'bg-white border-stone-200/80 hover:border-stone-300 hover:shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-105 ${cat.color}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-brand-700 text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>

                  <h3 className="font-editorial text-lg font-bold text-stone-900 mb-1.5 group-hover:text-brand-700 transition-colors">
                    {cat.name}
                  </h3>

                  <p className="text-xs text-stone-600 leading-relaxed line-clamp-2 mb-4">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] font-medium text-stone-500">
                  <span>{cat.articleCount} published essays</span>
                  <span className="text-brand-700 font-semibold group-hover:underline flex items-center gap-0.5">
                    Browse
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
