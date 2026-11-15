import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import ArticleCard from './ArticleCard';
import { SAMPLE_ARTICLES } from '../../data/sampleArticles';

export default function FeaturedArticles({ onReadStory, onOpenAuth }) {
  const [selectedTag, setSelectedTag] = useState('All');

  const tags = ['All', 'Personal Growth', 'Programming', 'Artificial Intelligence', 'Lifestyle'];

  const filteredArticles =
    selectedTag === 'All'
      ? SAMPLE_ARTICLES
      : SAMPLE_ARTICLES.filter((art) => art.category === selectedTag);

  return (
    <section id="explore" className="py-20 sm:py-24 bg-stone-50/60 border-t border-b border-stone-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12 gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-700">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Curated Selection</span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
              Featured Articles
            </h2>
            <p className="text-stone-600 text-sm sm:text-base max-w-xl">
              Thought-provoking perspectives, long-form essays, and deep architectural analyses hand-picked by the WriteSpace editorial collective.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-all ${
                  selectedTag === tag
                    ? 'bg-brand-700 text-white shadow-sm'
                    : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Article Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
          {filteredArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onReadStory={onReadStory}
            />
          ))}
        </div>

        {/* View All Stories Banner */}
        <div className="mt-12 text-center">
          <button
            onClick={() => onOpenAuth('get-started')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800 transition-colors group cursor-pointer"
          >
            <span>Explore 10,000+ member-written stories on WriteSpace</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

      </div>
    </section>
  );
}
