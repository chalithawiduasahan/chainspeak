import Lottie from "lottie-react";
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useInView } from "react-intersection-observer";
import React, { useState, useEffect } from 'react';
import { MessageCircle, Shield, Brain, Lock, DollarSign, ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onStartChainSpeaking: () => void;
}

// Reusable animation component for individual elements
function AnimatedElement({ 
  children, 
  delay = 0, 
  direction = 'up',
  threshold = 0.3,
  className = ""
}) {
  const controls = useAnimation();
  const [ref, inView] = useInView({ 
    triggerOnce: false, 
    threshold,
    rootMargin: '-50px 0px'
  });

  const variants = {
    up: { y: 40, opacity: 0 },
    down: { y: -40, opacity: 0 },
    left: { x: -40, opacity: 0 },
    right: { x: 40, opacity: 0 },
    scale: { scale: 0.8, opacity: 0 }
  };

  useEffect(() => {
    if (inView) {
      controls.start({ 
        x: 0, 
        y: 0, 
        scale: 1, 
        opacity: 1,
        transition: { 
          duration: 0.6, 
          delay,
          ease: [0.25, 0.46, 0.45, 0.94]
        }
      });
    } else {
      controls.start({ 
        ...variants[direction],
        transition: { 
          duration: 0.4,
          ease: [0.25, 0.46, 0.45, 0.94]
        }
      });
    }
  }, [controls, inView, delay, direction]);

  return (
    <motion.div
      ref={ref}
      initial={variants[direction]}
      animate={controls}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Staggered animation for card grids
function StaggeredCards({ children, staggerDelay = 0.1 }) {
  return (
    <>
      {React.Children.map(children, (child, index) => (
        <AnimatedElement 
          delay={index * staggerDelay} 
          direction="up"
          threshold={0.2}
        >
          {child}
        </AnimatedElement>
      ))}
    </>
  );
}

function HeroSection({ onStartChainSpeaking }: HeroSectionProps) {
  const [howItWorksAnimation, setHowItWorksAnimation] = useState(null);
  const [cubeAnimation, setCubeAnimation] = useState(null);

  useEffect(() => {
    fetch("/Animation - 1750678633967.json")
      .then((res) => res.json())
      .then((data) => setHowItWorksAnimation(data));
  }, []);

  useEffect(() => {
    fetch("/Animation - 1750698948810.json")
      .then((res) => res.json())
      .then((data) => setCubeAnimation(data));
  }, []);

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const dynamicWords = ['Freedom', 'Control', 'Ownership', 'Security'];

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeout(() => {
        setCurrentWordIndex((prev) => (prev + 1) % dynamicWords.length);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      {/* Hero Section - No changes, keep as is */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 md:px-8 pt-32 pb-20 relative overflow-hidden">
        {/* 3 Floating Cubes */}
        {cubeAnimation && (
          <>
            {/* Top Left Cube */}
            <div
              className="absolute w-[100px] h-[84px] sm:w-[400px] sm:h-[300px] opacity-50 sm:opacity-65 backdrop-blur-[2px] sm:backdrop-blur-0 pointer-events-none z-2"
              style={{
                top: '15%',
                left: '3%',
                transform: 'rotateY(-30deg) rotateX(20deg) scale(1.1)',
                animation: 'floatCube1 5s ease-in-out infinite',
              }}
            >
              <Lottie animationData={cubeAnimation} loop={true} style={{ width: '100%', height: '100%' }} />
            </div>
            {/* Bottom Right Cube */}
            <div
              className="absolute w-[70px] h-[70px] sm:w-[145px] sm:h-[145px] opacity-60 sm:opacity-70 backdrop-blur-[2px] sm:backdrop-blur-0 pointer-events-none z-2"
              style={{
                bottom: '40%',
                right: '16%',
                transform: 'rotateY(25deg) rotateX(-15deg) scale(1.15)',
                animation: 'floatCube2 6s ease-in-out infinite',
              }}
            >
              <Lottie animationData={cubeAnimation} loop={true} style={{ width: '100%', height: '100%' }} />
            </div>
            {/* Bottom Left Cube */}
            <div
              className="absolute w-[60px] h-[60px] sm:w-[110px] sm:h-[110px] opacity-60 sm:opacity-90 backdrop-blur-[2px] sm:backdrop-blur-0 pointer-events-none z-2"
              style={{
                bottom: '3%',
                left: '27%',
                transform: 'rotateY(-15deg) rotateX(-25deg) scale(1.05)',
                animation: 'floatCube3 7s ease-in-out infinite',
              }}
            >
              <Lottie animationData={cubeAnimation} loop={true} style={{ width: '100%', height: '100%' }} />
            </div>
          </>
        )}

        {/* Blockchain Network Nodes */}
        <div className="absolute inset-0 opacity-20 backdrop-blur-md">
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-blue-400 rounded-full shadow-lg shadow-blue-400/50"></div>
          <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-purple-400 rounded-full shadow-lg shadow-purple-400/50"></div>
          <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-pink-400 rounded-full shadow-lg shadow-pink-400/50"></div>
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50"></div>
          <div className="absolute bottom-1/3 left-1/5 w-2 h-2 bg-green-400 rounded-full shadow-lg shadow-green-400/50"></div>
          
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
            <defs>
              <linearGradient id="lineGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="lineGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ec4899" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <line x1="25%" y1="25%" x2="75%" y2="75%" stroke="url(#lineGradient1)" strokeWidth="1" />
            <line x1="75%" y1="25%" x2="25%" y2="75%" stroke="url(#lineGradient2)" strokeWidth="1" />
            <line x1="33%" y1="80%" x2="66%" y2="33%" stroke="url(#lineGradient1)" strokeWidth="0.5" />
          </svg>
        </div>

        {/* Floating Chain Links */}
        <div className="absolute inset-0 opacity-10 backdrop-blur-md">
          <div className="absolute top-1/5 left-1/5 transform rotate-45">
            <div className="w-8 h-4 border-2 rounded-full border-blue-400"></div>
            <div className="w-8 h-4 border-2 rounded-full -mt-2 ml-3 border-purple-400"></div>
          </div>
          <div className="absolute bottom-1/5 right-1/5 transform -rotate-45">
            <div className="w-6 h-3 border-2 rounded-full border-pink-400"></div>
            <div className="w-6 h-3 border-2 rounded-full -mt-1.5 ml-2 border-cyan-400"></div>
          </div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          {/* Main Headlines */}
          <div className="space-y-3 md:space-y-6 mb-6 md:mb-12">
            <div className="h-12"></div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold leading-tight transition-all duration-300 animate-fadeIn px-2 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
              Your Thoughts Deserve Privacy.
            </h1>
            <div className="relative px-4">
              <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                <span className="text-white">Your Data Deserves{' '}</span>
                <span className="relative w-full sm:w-auto" style={{ minWidth: '9ch', display: 'inline-block' }}>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={dynamicWords[currentWordIndex]}
                      initial={{ rotateX: 90, opacity: 0 }}
                      animate={{ rotateX: 0, opacity: 1 }}
                      exit={{ rotateX: -90, opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent block"
                      style={{ display: 'inline-block', willChange: 'transform, opacity', textAlign: 'center' }}
                    >
                      {dynamicWords[currentWordIndex]}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </h2>
            </div>
          </div>

          {/* Enhanced Subtext */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 md:mb-16 max-w-4xl mx-auto leading-relaxed transition-colors duration-300 animate-fadeIn px-4 text-gray-300" style={{ animationDelay: '0.3s' }}>
            ChainSpeak is your AI-powered memory vault. Turn your thoughts into assets. Store them on-chain, stay anonymous, and { ' ' }
            <br className="block sm:hidden" />
            <span className="font-semibold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">own your voice</span>.
          </p>

          {/* Enhanced CTA Button */}
          <div className="animate-fadeIn px-4" style={{ animationDelay: '0.6s' }}>
            <button
              onClick={onStartChainSpeaking}
              className="group relative px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-6 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white text-base sm:text-lg md:text-2xl font-bold rounded-2xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 overflow-hidden w-full sm:w-auto max-w-sm sm:max-w-none mx-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700"></div>
              
              <span className="relative z-10 flex items-center justify-center space-x-2 sm:space-x-3">
                <span>Start ChainSpeaking</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* How It Works Section - Now with individual animations */}
      <section id="about" className="py-16 md:py-24 px-4 md:px-8 relative bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-6xl mx-auto">
          {/* Animated section header */}
          <div className="text-center mb-12 md:mb-16">
            <AnimatedElement direction="up" delay={0}>
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white">
                How It Works
              </h3>
            </AnimatedElement>
            <AnimatedElement direction="scale" delay={0.2}>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto"></div>
            </AnimatedElement>
          </div>
          
          {/* Two-column layout */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
            {/* Left column: Animation */}
            <AnimatedElement direction="left" delay={0.3} className="w-full md:w-1/2 flex justify-center md:justify-start md:pl-4">
              {howItWorksAnimation && (
                <div className="w-3/4 max-w-xs md:max-w-sm lg:max-w-md" style={{ transform: 'scaleX(-1)' }}>
                  <Lottie animationData={howItWorksAnimation} loop={true} />
                </div>
              )}
            </AnimatedElement>
            
            {/* Right column: Cards with staggered animation */}
            <div className="w-full md:w-1/2 space-y-10 md:space-y-12">
              <StaggeredCards staggerDelay={0.15}>
                {[
                  {
                    icon: Brain,
                    title: 'Speak Your Mind Anonymously',
                    description: 'Share thoughts without revealing identity',
                    color: 'from-blue-500 to-cyan-500'
                  },
                  {
                    icon: Lock,
                    title: 'Conversations Are Encrypted & Stored',
                    description: 'Your chats are encrypted and stored on-chain. only you hold the key.',
                    color: 'from-purple-500 to-pink-500'
                  },
                  {
                    icon: DollarSign,
                    title: 'Monetize Your Memories',
                    description: 'List your chats and earn. stay anonymous',
                    color: 'from-green-500 to-emerald-500'
                  }
                ].map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div 
                      key={index} 
                      className="flex items-start space-x-4 md:space-x-6 p-4 md:p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl group bg-gray-800/80 border-gray-700 hover:bg-gray-700"
                    >
                      <div className="relative flex-shrink-0">
                        <div className={`inline-flex items-center justify-center w-18 h-18 md:w-20 md:h-20 rounded-full bg-gradient-to-br ${step.color} shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl relative`}>
                          <Icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                          <div className={`absolute -top-2 -right-2 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base shadow-lg bg-gradient-to-br ${step.color}`}>
                            {index + 1}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-white">
                          {step.title}
                        </h4>
                        <p className="text-sm md:text-base leading-relaxed text-gray-300">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </StaggeredCards>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Individual animations */}
      <section id="features" className="py-16 md:py-24 px-4 md:px-8 relative bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="max-w-6xl mx-auto">
          {/* Animated section header */}
          <div className="text-center mb-12 md:mb-16">
            <AnimatedElement direction="up" delay={0}>
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white">
                Why ChainSpeak?
              </h3>
            </AnimatedElement>
            <AnimatedElement direction="scale" delay={0.2}>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto"></div>
            </AnimatedElement>
          </div>
          
          {/* Feature cards with staggered animation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <StaggeredCards staggerDelay={0.2}>
              {[
                {
                  icon: Shield,
                  title: 'Private by Default',
                  description: 'ChainSpeak redefines digital ownership. It gives you full control over your on-chain identity, on your terms.',
                  color: 'from-blue-500 to-cyan-500'
                },
                {
                  icon: Brain,
                  title: 'AI-Powered Chat',
                  description: 'Get GPT-class responses in real time without compromising your privacy. ChainSpeak delivers intelligence without the data trade-off.',
                  color: 'from-purple-500 to-pink-500'
                },
                {
                  icon: DollarSign,
                  title: 'Sellable Memory Logs',
                  description: 'Push your chats to the marketplace. Set your price. Earn from them. Turn your words into assets. ChainSpeak gives you control.',
                  color: 'from-green-500 to-emerald-500'
                }
              ].map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div 
                    key={index}
                    className="p-6 md:p-8 rounded-2xl border backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-2xl group bg-gray-800/80 border-gray-700 hover:border-gray-600"
                  >
                    <div className={`inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-xl bg-gradient-to-br ${feature.color} shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                    </div>
                    <h4 className="text-xl md:text-2xl font-bold mb-4 text-white">
                      {feature.title}
                    </h4>
                    <p className="text-base md:text-lg leading-relaxed text-gray-300">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </StaggeredCards>
          </div>
        </div>
      </section>

      {/* Emotional Hook Section - Individual animations */}
      <section id="docs" className="py-16 md:py-24 px-4 md:px-8 relative bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-4xl mx-auto text-center">
          {/* Animated floating cubes */}
          {cubeAnimation && (
            <>
              <div
  className="absolute w-[60px] h-[50px] sm:w-[300px] sm:h-[300px] opacity-45 pointer-events-none z-1 top-[25%] sm:top-[45%] left-[4%]"
  style={{ animation: 'floatCube6 5s ease-in-out infinite' }}
>
  <Lottie animationData={cubeAnimation} loop={true} style={{ width: '100%', height: '100%' }} />
</div>

              <div
  className="absolute w-[90px] h-[80px] sm:w-[145px] sm:h-[145px] opacity-45 pointer-events-none z-1 top-[-4%] sm:top-[5%] right-[9%]"
  style={{ animation: 'floatCube7 5s ease-in-out infinite' }}
>
  <Lottie animationData={cubeAnimation} loop={true} style={{ width: '100%', height: '100%' }} />
</div>

            </>
          )}

          {/* Animated main heading */}
          <AnimatedElement direction="up" delay={0}>
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 md:mb-8 leading-tight text-white">
              Your thoughts deserve more than just a reply, They deserve to be{' '}
              <span className="relative">
                <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  yours.
                </span>
                <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              </span>
            </h3>
          </AnimatedElement>
          
          {/* Animated subtext */}
          <AnimatedElement direction="up" delay={0.2}>
            <p className="text-lg md:text-xl lg:text-2xl mb-8 md:mb-12 text-gray-300">
              ChainSpeak blends <span className="font-semibold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">AI freedom with blockchain power</span>.
              <br />
              your words, encrypted, eternal, and yours to monetize.
            </p>
          </AnimatedElement>

          {/* Animated chat mockup */}
          <AnimatedElement direction="scale" delay={0.4}>
            <div className="max-w-2xl mx-auto p-6 md:p-8 rounded-2xl backdrop-blur-sm border shadow-2xl mb-12 md:mb-16 bg-gray-800/80 border-gray-700">
              <div className="space-y-4 md:space-y-6">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                    <MessageCircle className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <div className="flex-1 p-3 md:p-4 rounded-lg shadow-md bg-gray-700">
                    <p className="text-sm md:text-base text-gray-300">
                      "I had this idea for a startup last year, but never saved it anywhere. Wish I had."
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 justify-end">
                  <div className="flex-1 max-w-xs md:max-w-sm p-3 md:p-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg">
                    <p className="text-sm md:text-base">
                      "This is your secure vault. Drop the idea here. It’ll be yours forever."
                    </p>
                  </div>
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                    <Shield className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </AnimatedElement>

          <br />
          <br />
          <br />
          <br />

          {/* Final CTA Section with animations */}
          <div className="text-center">
            <AnimatedElement direction="up" delay={0}>
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 md:mb-8 text-white">
                It's your mind. Your memories.
                <br />
                <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Your data.
                </span>
              </h3>
            </AnimatedElement>
            
            <AnimatedElement direction="up" delay={0.2}>
              <p className="text-lg md:text-xl mb-8 md:mb-12 text-gray-300">
                Take the power back.
              </p>
            </AnimatedElement>

            <AnimatedElement direction="scale" delay={0.4}>
              <button
                onClick={onStartChainSpeaking}
                className="group relative px-8 md:px-12 py-4 md:py-6 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white text-xl md:text-2xl font-bold rounded-2xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 overflow-hidden mb-6 hover:bg-white/10 hover:backdrop-blur-md hover:border hover:border-white/20"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700"></div>
                <span className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 backdrop-blur-md transition-all duration-300 pointer-events-none"></span>
                <span className="relative z-10 flex items-center space-x-3">
                  <span>Start Now</span>
                  <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </button>
            </AnimatedElement>

            <AnimatedElement direction="up" delay={0.6}>
              <p className="text-sm md:text-base text-gray-400">
               • No signup required • privacy guaranteed
              </p>
            </AnimatedElement>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HeroSection;