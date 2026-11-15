import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import HeroSection from '../components/landing/HeroSection';
import FeaturedArticles from '../components/articles/FeaturedArticles';
import BenefitsSection from '../components/landing/BenefitsSection';
import HowItWorks from '../components/landing/HowItWorks';
import CategoriesSection from '../components/landing/CategoriesSection';
import CTASection from '../components/landing/CTASection';
import Footer from '../components/layout/Footer';
import StoryPreviewModal from '../components/articles/StoryPreviewModal';

export default function Landing() {
  const navigate = useNavigate();
  const [selectedStory, setSelectedStory] = useState(null);

  const handleOpenAuth = (mode = 'get-started') => {
    if (mode === 'sign-in') {
      navigate('/login');
    } else {
      navigate('/register');
    }
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

      {/* Story Reader Preview Modal */}
      <StoryPreviewModal
        article={selectedStory}
        onClose={() => setSelectedStory(null)}
        onOpenAuth={handleOpenAuth}
      />
    </div>
  );
}
