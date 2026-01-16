import React from 'react';
import LandingNavigation from './LandingNavigation';
import HeroSection from './HeroSection';

interface LandingPageProps {
  onStartChainSpeaking: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ 
  onStartChainSpeaking 
}) => {
  return (
    <div className="min-h-screen w-full transition-all duration-500 bg-gradient-to-br from-black via-gray-900 to-gray-800">
      <LandingNavigation 
        onStartChainSpeaking={onStartChainSpeaking}
      />
      <HeroSection 
        onStartChainSpeaking={onStartChainSpeaking} 
      />
    </div>
  );
};

export default LandingPage;