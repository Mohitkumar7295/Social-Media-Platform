import React from 'react';
import { PenTool, ArrowRight, Sparkles, Feather } from 'lucide-react';
import Button from '../common/Button';

export default function CTASection({ onOpenAuth }) {
  return (
    <section className="py-20 sm:py-24 bg-stone-50/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Highlight Card */}
        <div className="relative rounded-3xl bg-gradient-to-br from-brand-900 via-brand-800 to-stone-900 text-white p-8 sm:p-14 lg:p-20 overflow-hidden shadow-2xl">
          
          {/* Subtle Ambient Glows & Background Elements */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
          <Feather className="absolute right-8 bottom-6 w-56 h-56 text-white/5 pointer-events-none -rotate-12" />

          <div className="relative max-w-3xl mx-auto text-center space-y-6">
            
            {/* Kicker */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-brand-200 text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Join WriteSpace Today</span>
            </div>

            {/* Heading */}
            <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              Every Great Idea Starts With a Story.
            </h2>

            {/* Description */}
            <p className="text-base sm:text-lg text-brand-100/90 leading-relaxed max-w-2xl mx-auto font-normal">
              Join WriteSpace and become part of a community that believes in the power of ideas. No advertisements, no clickbait algorithms—just pure writing and thoughtful reading.
            </p>

            {/* Action CTA */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="white"
                size="lg"
                icon={PenTool}
                onClick={() => onOpenAuth('get-started')}
                className="w-full sm:w-auto shadow-lg hover:bg-brand-50 hover:text-brand-900 font-semibold"
              >
                Start Your Writing Journey
              </Button>
            </div>

            <div className="pt-6 text-xs text-brand-200/70 flex items-center justify-center gap-6">
              <span>Free Forever for Readers</span>
              <span>•</span>
              <span>Keep 100% of Your Voice</span>
              <span>•</span>
              <span>Cancel Anytime</span>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
