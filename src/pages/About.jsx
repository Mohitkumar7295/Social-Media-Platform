import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Feather,
  BookOpen,
  Users,
  Sparkles,
  Heart,
  Compass,
  ArrowRight,
  Shield,
  PenLine,
  Layers,
  MessageCircle,
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useAuth } from '../hooks/useAuth';

export default function About() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleStartWriting = () => {
    if (isAuthenticated) {
      navigate('/write');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#201F1D] selection:bg-[#E9F8F5] selection:text-[#0F8178]">
      {/* Sticky Header Navigation */}
      <Navbar />

      <main className="flex-1 pt-24 sm:pt-28 pb-16">
        {/* Section 1: Hero Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12 sm:py-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E9F8F5] border border-[#0F8178]/20 text-[#0F8178] text-xs font-semibold uppercase tracking-wider mb-6">
            <Feather className="w-3.5 h-3.5" />
            <span>Editorial Publishing Reimagined</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#201F1D] tracking-tight leading-[1.15] mb-6">
            Where thoughtful ideas find their readers.
          </h1>

          <p className="text-lg sm:text-xl text-[#777777] leading-relaxed max-w-2xl mx-auto mb-10">
            WriteSpace is an open editorial home designed for writers, essayists, thinkers, and curious readers. We combine deep, distraction-free publishing with modern community discourse.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              type="button"
              onClick={handleStartWriting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#0F8178] hover:bg-[#086B64] text-white font-semibold text-sm shadow-sm transition-all duration-150"
            >
              <PenLine className="w-4 h-4" />
              <span>Start Writing Today</span>
            </button>

            <Link
              to="/explore"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-[#F8FAF9] text-[#201F1D] border border-[#E8EAE8] font-semibold text-sm transition-all duration-150"
            >
              <Compass className="w-4 h-4 text-[#0F8178]" />
              <span>Explore Stories</span>
              <ArrowRight className="w-4 h-4 text-[#777777]" />
            </Link>
          </div>
        </section>

        {/* Section 2: Our Mission */}
        <section className="bg-[#F8FAF9] border-y border-[#E8EAE8] py-16 sm:py-20 my-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center mb-14">
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#201F1D] tracking-tight mb-3">
                Our Mission
              </h2>
              <p className="text-sm sm:text-base text-[#777777] leading-relaxed">
                In an era of fleeting notifications and fragmented attention, we are building a sanctuary for ideas that matter.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: BookOpen,
                  title: 'Thoughtful Reading',
                  desc: 'Clean typography, comfortable contrast, and distraction-free layouts that respect your focus.',
                },
                {
                  icon: PenLine,
                  title: 'Empowered Writers',
                  desc: 'A full-featured rich editor, autosaved drafts, publication controls, and direct subscriber engagement.',
                },
                {
                  icon: Users,
                  title: 'Direct Connection',
                  desc: 'Readers directly follow their favorite writers and receive fresh stories in a clean chronological feed.',
                },
                {
                  icon: Shield,
                  title: 'Data & Privacy First',
                  desc: 'Private drafts and bookmarks are strictly protected at the database layer with zero tracking ads.',
                },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white border border-[#E8EAE8] rounded-2xl p-6 shadow-sm hover:border-[#0F8178]/30 transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#E9F8F5] text-[#0F8178] flex items-center justify-center mb-5">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-serif font-bold text-lg text-[#201F1D] mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#777777] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 3: What Makes WriteSpace Different */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#201F1D] tracking-tight mb-3">
              What Makes WriteSpace Different
            </h2>
            <p className="text-sm sm:text-base text-[#777777] leading-relaxed">
              We reimagined publishing by blending Substack’s creator independence with Medium’s reading delight.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border border-[#E8EAE8] rounded-2xl p-8 hover:border-[#0F8178]/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#E9F8F5] text-[#0F8178] flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-xl text-[#201F1D] mb-2.5">
                Modern Editorial Studio
              </h3>
              <p className="text-sm text-[#777777] leading-relaxed mb-4">
                Write with full freedom using our TipTap rich-text writing studio. Effortlessly upload custom cover images, format blockquotes and headings, categorize your stories, and preview before publishing.
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-[#555555]">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0F8178]" />
                  <span>Autosaved draft recovery with zero data loss</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0F8178]" />
                  <span>Real-time reading time estimations</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0F8178]" />
                  <span>Permanent, human-readable SEO slugs</span>
                </li>
              </ul>
            </div>

            <div className="bg-white border border-[#E8EAE8] rounded-2xl p-8 hover:border-[#0F8178]/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#E9F8F5] text-[#0F8178] flex items-center justify-center mb-4">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-xl text-[#201F1D] mb-2.5">
                Authentic Community Discourse
              </h3>
              <p className="text-sm text-[#777777] leading-relaxed mb-4">
                Engage in meaningful conversations without algorithmic toxicity. Readers can applaud stories, bookmark pieces into private collections, and participate in threaded discussions.
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-[#555555]">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0F8178]" />
                  <span>Atomic applause counters with duplicate protection</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0F8178]" />
                  <span>Author-moderated nested reply chains</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0F8178]" />
                  <span>Live notification alerts for follows and replies</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 4: Call to Action Banner */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="bg-[#E9F8F5] border border-[#0F8178]/20 rounded-3xl p-8 sm:p-12 text-center">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#201F1D] tracking-tight mb-3">
              Ready to share your voice?
            </h2>
            <p className="text-sm sm:text-base text-[#555555] max-w-lg mx-auto leading-relaxed mb-8">
              Join thousands of readers and authors publishing their best ideas on WriteSpace. Free forever for independent creators.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleStartWriting}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#0F8178] hover:bg-[#086B64] text-white font-semibold text-sm shadow-sm transition-all"
              >
                Create Your Publication
              </button>
              <Link
                to="/explore"
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-white hover:bg-stone-50 text-[#201F1D] border border-[#E8EAE8] font-semibold text-sm transition-all"
              >
                Browse Stories
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
