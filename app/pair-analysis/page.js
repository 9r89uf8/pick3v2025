'use client';
import React from 'react';
import PairAnalysis from '@/app/components/pair-analysis/PairAnalysis';
import Link from 'next/link';

// Icon components
const ArrowBackIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const HomeIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
  </svg>
);

const PairAnalysisPage = () => {
  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-background-primary text-foreground">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900/95 to-black" />
        <div className="page-grid-overlay absolute inset-0 opacity-60" />
        <div className="absolute -top-32 -left-28 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute bottom-[-18%] right-[-12%] h-96 w-96 rounded-full bg-accent-gold/20 blur-[140px]" />
      </div>

      <div className="relative z-10 pb-10 md:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-10">
          <div className="glass-card border border-accent-gold/20 rounded-3xl shadow-2xl shadow-black/40">
            <div className="px-4 sm:px-6 lg:px-8 py-6 md:py-10">
              {/* Navigation Buttons */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-center md:justify-between gap-4 mb-6">
                <Link
                  href="/combinations"
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-accent-gold/40 bg-slate-900/60 text-accent-gold transition-all duration-200 hover:border-accent-gold hover:bg-slate-900/80 hover:shadow-glow"
                >
                  <ArrowBackIcon />
                  <span className="hidden sm:inline">Back to Combinations</span>
                  <span className="sm:hidden">Combinations</span>
                </Link>

                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                  <Link
                    href="/favorites"
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-accent-gold/40 bg-slate-900/60 text-accent-gold transition-all duration-200 hover:border-accent-gold hover:bg-slate-900/80 hover:shadow-glow"
                  >
                    <StarIcon />
                    <span className="hidden sm:inline">Favorites</span>
                    <span className="sm:hidden">★ Favorites</span>
                  </Link>

                  <Link
                    href="/"
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-accent-gold/40 bg-slate-900/60 text-accent-gold transition-all duration-200 hover:border-accent-gold hover:bg-slate-900/80 hover:shadow-glow"
                  >
                    <HomeIcon />
                    <span className="hidden sm:inline">Home</span>
                    <span className="sm:hidden">🏠 Home</span>
                  </Link>
                </div>
              </div>

              {/* Title and Description */}
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-center mb-4 gradient-text">
                Pair Analysis
              </h1>
              <p className="text-sm sm:text-base md:text-xl text-slate-300 max-w-3xl mx-auto text-center px-2 sm:px-4">
                Analyze first-two number pair frequencies and their correlation with possible third number combinations
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-2 sm:px-4 md:px-6 mt-6 md:mt-10">
          <PairAnalysis />
        </div>
      </div>
    </div>
  );
};

export default PairAnalysisPage;
