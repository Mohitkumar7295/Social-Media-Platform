import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import HeroSection from '../components/landing/HeroSection';
import FeaturedArticles from '../components/landing/FeaturedArticles';
import BenefitsSection from '../components/landing/BenefitsSection';
import HowItWorks from '../components/landing/HowItWorks';
import CategoriesSection from '../components/landing/CategoriesSection';
import CTASection from '../components/landing/CTASection';
import Footer from '../components/layout/Footer';
import Modal from '../components/common/Modal';
import StoryPreviewModal from '../components/landing/StoryPreviewModal';

export default function Landing() {
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'get-started' });
  const [selectedStory, setSelectedStory] = useState(null);

  const handleOpenAuth = (mode = 'get-started') => {
    setAuthModal({ isOpen: true, mode });
  };

  const handleCloseAuth = () => {
    setAuthModal({ isOpen: false, mode: 'get-started' });
  };

  const handleExploreClick = () => {
    const exploreSection = document.getElementById('explore');
    if (exploreSection) {
      exploreSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectCategory = (category) => {
    const exploreSection = document.getElementById('explore');
    if (exploreSection) {
      exploreSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas-light text-stone-900 selection:bg-brand-100 selection:text-brand-900">
      {/* Sticky Header Navigation */}
      <Navbar onOpenAuth={handleOpenAuth} />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Section B: Hero Section */}
        <HeroSection
          onOpenAuth={handleOpenAuth}
          onExploreClick={handleExploreClick}
        />

        {/* Section C: Featured Articles Section */}
        <FeaturedArticles
          onReadStory={(story) => setSelectedStory(story)}
          onOpenAuth={handleOpenAuth}
        />

        {/* Section D: Why WriteSpace (Benefits) Section */}
        <BenefitsSection />

        {/* Section E: How It Works Section */}
        <HowItWorks onOpenAuth={handleOpenAuth} />

        {/* Section F: Popular Categories Section */}
        <CategoriesSection onSelectCategory={handleSelectCategory} />

        {/* Section G: Call to Action Section */}
        <CTASection onOpenAuth={handleOpenAuth} />
      </main>

      {/* Section H: Footer */}
      <Footer onOpenAuth={handleOpenAuth} />

      {/* Auth Interaction Modal (Phase 1 Preview) */}
      <Modal
        isOpen={authModal.isOpen}
        mode={authModal.mode}
        onClose={handleCloseAuth}
      />

      {/* Story Reader Preview Modal */}
      <StoryPreviewModal
        article={selectedStory}
        onClose={() => setSelectedStory(null)}
        onOpenAuth={handleOpenAuth}
      />
    </div>
  );
}
