import React, { useState } from 'react';
import { MessageCircle, Menu, X } from 'lucide-react';

interface LandingNavigationProps {
  onStartChainSpeaking: () => void;
}

const LandingNavigation: React.FC<LandingNavigationProps> = ({ 
  onStartChainSpeaking 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b transition-all duration-500 bg-gray-900/80 border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-purple-500/25">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <MessageCircle className="w-6 h-6 text-white relative z-10" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-30 blur transition-opacity duration-300"></div>
              </div>
              <span className="text-xl font-bold transition-colors duration-300 text-white">
                ChainSpeak
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection('about')}
                className="text-sm font-medium transition-all duration-300 hover:scale-105 relative group text-gray-300 hover:text-white"
              >
                About
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 group-hover:w-full"></span>
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="text-sm font-medium transition-all duration-300 hover:scale-105 relative group text-gray-300 hover:text-white"
              >
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 group-hover:w-full"></span>
              </button>
              <button
                onClick={() => scrollToSection('docs')}
                className="text-sm font-medium transition-all duration-300 hover:scale-105 relative group text-gray-300 hover:text-white"
              >
                Mission
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 group-hover:w-full"></span>
              </button>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={onStartChainSpeaking}
                className="hidden md:flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <span className="relative z-10">Start ChainSpeaking</span>
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 rounded-xl transition-all duration-300 text-gray-300 hover:text-white hover:bg-gray-800"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
        mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
        <div className={`absolute top-20 left-4 right-4 rounded-2xl shadow-2xl transition-all duration-300 transform ${
          mobileMenuOpen ? 'translate-y-0 scale-100' : '-translate-y-4 scale-95'
        } bg-gray-900/95 border border-gray-800`}>
          <div className="p-6 space-y-4">
            <button
              onClick={() => scrollToSection('about')}
              className="block w-full text-left py-3 px-4 rounded-xl transition-all duration-300 text-gray-300 hover:text-white hover:bg-gray-800"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="block w-full text-left py-3 px-4 rounded-xl transition-all duration-300 text-gray-300 hover:text-white hover:bg-gray-800"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('docs')}
              className="block w-full text-left py-3 px-4 rounded-xl transition-all duration-300 text-gray-300 hover:text-white hover:bg-gray-800"
            >
              Mission
            </button>
            <button
              onClick={onStartChainSpeaking}
              className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
            >
              Start ChainSpeaking
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingNavigation;