import React, { useState, useEffect } from 'react';

/**
 * Reading Progress Indicator
 * Fixed at the very top of the article view, updating smoothly as the reader scrolls.
 */
export default function ReadingProgressBar({ targetRef }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let animationFrameId = null;

    const handleScroll = () => {
      if (animationFrameId) return;

      animationFrameId = requestAnimationFrame(() => {
        animationFrameId = null;

        if (targetRef && targetRef.current) {
          const element = targetRef.current;
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + window.scrollY;
          const elementHeight = element.scrollHeight;
          const windowHeight = window.innerHeight;

          // How far scrolled past the top of the article
          const scrolledPast = window.scrollY - elementTop;
          const totalDistance = elementHeight - windowHeight;

          if (scrolledPast <= 0) {
            setProgress(0);
          } else if (totalDistance <= 0 || scrolledPast >= totalDistance) {
            setProgress(100);
          } else {
            const calculated = Math.min(100, Math.max(0, (scrolledPast / totalDistance) * 100));
            setProgress(calculated);
          }
        } else {
          // Fallback to window scroll progress
          const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
          if (totalScroll > 0) {
            const currentScroll = window.scrollY;
            setProgress(Math.min(100, (currentScroll / totalScroll) * 100));
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [targetRef]);

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-zinc-900/60 z-50 pointer-events-none">
      <div
        className="h-full bg-[#FF6719] transition-all duration-75 ease-out shadow-sm shadow-orange-500/50"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
