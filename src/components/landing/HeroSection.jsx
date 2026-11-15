import React from 'react';
import { PenLine, Compass, Sparkles, TrendingUp, CheckCircle2, Bookmark, Heart, MessageSquare } from 'lucide-react';
import Button from '../common/Button';

export default function HeroSection({ onOpenAuth, onExploreClick }) {
  return (
    <section id="hero" className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Subtle Editorial Background Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-brand-100/40 via-amber-100/20 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-1/3 -right-20 w-[400px] h-[400px] bg-brand-50/60 rounded-full blur-2xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headline, Description & CTAs */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6 sm:space-y-8">
            {/* Kicker badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-brand-800 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-brand-600 animate-pulse" />
              <span>A Modern Editorial Publishing Network</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-stone-900 leading-[1.12]">
              Your Ideas Deserve a{' '}
              <span className="relative inline-block text-brand-700 underline decoration-brand-200 decoration-wavy decoration-2 underline-offset-8">
                Place to Grow.
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg sm:text-xl text-stone-600 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
              Discover inspiring stories, share your knowledge, and connect with a community of curious minds. Write freely. Read deeply. Grow together.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Button
                variant="primary"
                size="lg"
                icon={PenLine}
                onClick={() => onOpenAuth('get-started')}
                className="w-full sm:w-auto shadow-md hover:shadow-lg"
              >
                Start Writing
              </Button>
              <Button
                variant="outline"
                size="lg"
                icon={Compass}
                onClick={onExploreClick}
                className="w-full sm:w-auto"
              >
                Explore Stories
              </Button>
            </div>

            {/* Social Trust / Reader metrics */}
            <div className="pt-6 border-t border-stone-200/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-stone-500">
              <div className="flex items-center -space-x-2">
                <img
                  className="w-8 h-8 rounded-full border-2 border-white object-cover"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80"
                  alt="Writer"
                />
                <img
                  className="w-8 h-8 rounded-full border-2 border-white object-cover"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80"
                  alt="Writer"
                />
                <img
                  className="w-8 h-8 rounded-full border-2 border-white object-cover"
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&h=120&q=80"
                  alt="Writer"
                />
                <div className="w-8 h-8 rounded-full border-2 border-white bg-brand-700 text-white font-bold flex items-center justify-center text-[10px]">
                  +4k
                </div>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-stone-700">
                <CheckCircle2 className="w-4 h-4 text-brand-600" />
                <span>Over 12,000+ essays published this month</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Composition / Editorial Story Preview */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Primary Interactive Editorial Card */}
              <div className="bg-white rounded-2xl shadow-xl shadow-stone-200/70 border border-stone-200/90 p-6 sm:p-7 relative transition-transform hover:-translate-y-1 duration-300">
                
                {/* Story Category & Reading Time */}
                <div className="flex items-center justify-between text-xs text-stone-500 mb-4 pb-3 border-b border-stone-100">
                  <span className="font-semibold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-100">
                    Featured Essay
                  </span>
                  <span>7 min read · Published Today</span>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80"
                    alt="Elena Rostova"
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-100"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 leading-tight">Elena Rostova</h4>
                    <p className="text-xs text-stone-500">Essayist & Cultural Critic</p>
                  </div>
                </div>

                {/* Story Title & Excerpt */}
                <h3 className="font-editorial text-xl font-bold text-stone-900 mb-2 leading-snug hover:text-brand-700 transition-colors">
                  The Architecture of Stillness: Finding Quiet in the Information Deluge
                </h3>
                <p className="text-stone-600 text-xs sm:text-sm line-clamp-3 leading-relaxed mb-5">
                  We live in a culture that mistakes noise for velocity and distraction for depth. True creative synthesis demands periods of uninterrupted intellectual incubation...
                </p>

                {/* Interactive Bar */}
                <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-xs text-stone-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 hover:text-rose-600 transition cursor-pointer">
                      <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
                      <strong className="text-stone-700">642</strong>
                    </span>
                    <span className="flex items-center gap-1.5 hover:text-brand-700 transition cursor-pointer">
                      <MessageSquare className="w-4 h-4 text-stone-400" />
                      <strong className="text-stone-700">48</strong>
                    </span>
                  </div>
                  <Bookmark className="w-4 h-4 text-stone-400 hover:text-brand-700 transition cursor-pointer" />
                </div>
              </div>

              {/* Floating Highlight Badge 1: Followers */}
              <div className="absolute -top-5 -left-4 sm:-left-6 bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-lg border border-stone-100 flex items-center gap-3 animate-bounce [animation-duration:5s]">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-stone-500 font-medium">Audience Growth</div>
                  <div className="text-xs font-bold text-stone-900">+1,420 Readers this week</div>
                </div>
              </div>

              {/* Floating Highlight Badge 2: Distraction-free */}
              <div className="hidden sm:flex absolute -bottom-5 -right-4 bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-lg border border-stone-100 items-center gap-2.5">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-600"></span>
                </span>
                <span className="text-xs font-semibold text-stone-800">
                  Substack & Medium-grade Typography
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
