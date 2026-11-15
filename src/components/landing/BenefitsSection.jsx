import React from 'react';
import { Feather, Compass, Users, TrendingUp, Sparkles, ShieldCheck } from 'lucide-react';

export default function BenefitsSection() {
  const benefits = [
    {
      icon: Feather,
      title: 'Write Freely',
      tagline: 'Share your knowledge and ideas',
      description:
        'A clean, distraction-free markdown and rich editorial studio designed to let your thoughts flow without noisy dashboards or cluttered interfaces.',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    },
    {
      icon: Compass,
      title: 'Discover Stories',
      tagline: 'Explore valuable content',
      description:
        'Dive into chronologically honest feeds, reader-curated recommendations, and intelligent topic streams free from clickbait or engagement traps.',
      color: 'bg-blue-50 text-blue-700 border-blue-100',
    },
    {
      icon: Users,
      title: 'Build Connections',
      tagline: 'Follow writers and interact',
      description:
        'Form direct bonds with thought leaders and peers. Leave insightful comments, bookmark deep reads, and exchange ideas in thoughtful discussion threads.',
      color: 'bg-purple-50 text-purple-700 border-purple-100',
    },
    {
      icon: TrendingUp,
      title: 'Grow Together',
      tagline: 'Develop your audience and writing journey',
      description:
        'Cultivate an organic, loyal readership of intellectuals, developers, researchers, and creators who value depth and craft over algorithmic trends.',
      color: 'bg-amber-50 text-amber-700 border-amber-100',
    },
  ];

  return (
    <section id="about" className="py-20 sm:py-28 bg-canvas-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Why WriteSpace</span>
          </div>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
            Designed for Writers. Cherished by Readers.
          </h2>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            We built WriteSpace to return publishing to its most authentic essence: the meaningful resonance between an author’s words and a reader’s mind.
          </p>
        </div>

        {/* 4 Benefit Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {benefits.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="group bg-white rounded-2xl p-7 border border-stone-200/80 shadow-sm hover:shadow-md hover:border-stone-300 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 border ${item.color} transition-transform group-hover:scale-110 duration-300`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-stone-900 mb-1 font-editorial">
                    {item.title}
                  </h3>
                  <div className="text-xs font-semibold text-brand-700 mb-3">
                    {item.tagline}
                  </div>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-stone-100 text-xs font-medium text-stone-400 group-hover:text-brand-700 transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-brand-600" />
                  <span>WriteSpace Core Principle</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
