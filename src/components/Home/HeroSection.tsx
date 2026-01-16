import React from 'react';
import { MessageCircle, Shield, Sparkles, Brain, Lock, DollarSign } from 'lucide-react';

interface HeroSectionProps {
  darkMode: boolean;
  onGetStarted: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ darkMode, onGetStarted }) => {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 md:px-8 py-16 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-20 left-10 w-72 h-72 rounded-full opacity-20 animate-pulse ${
          darkMode ? 'bg-blue-500' : 'bg-blue-300'
        }`}></div>
        <div className={`absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-20 animate-pulse ${
          darkMode ? 'bg-purple-500' : 'bg-purple-300'
        }`} style={{ animationDelay: '1s' }}></div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-10 animate-pulse ${
          darkMode ? 'bg-cyan-500' : 'bg-cyan-300'
        }`} style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        {/* Glowing Icon Animation */}
        <div className="mb-12 relative">
          <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 ${
            darkMode 
              ? 'bg-gradient-to-br from-blue-600 to-purple-600' 
              : 'bg-gradient-to-br from-blue-500 to-purple-500'
          }`}>
            <MessageCircle className="w-16 h-16 text-white animate-pulse" />
            
            {/* Floating elements around the main icon */}
            <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-bounce">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div className="absolute -bottom-3 -left-3 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '0.5s' }}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Main Headlines */}
        <h1 className={`text-5xl md:text-7xl font-bold mb-4 leading-tight transition-all duration-300 ${
          darkMode 
            ? 'bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent'
            : 'bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent'
        }`}>
          Your Thoughts Deserve Privacy.
        </h1>
        
        <h2 className="text-4xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          Your Data Deserves Control.
        </h2>

        {/* One-liner */}
        <p className={`text-xl md:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed transition-colors duration-300 ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          ChainSpeak is your AI-powered anonymous space to speak freely, think safely, 
          and <span className="font-semibold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">own your own voice</span>.
        </p>

        {/* CTA Button */}
        <button
          onClick={onGetStarted}
          className="group relative px-12 py-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-2xl font-bold rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 overflow-hidden mb-16"
        >
          {/* Glowing effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700"></div>
          <span className="relative z-10">Start ChainSpeaking</span>
        </button>

        {/* How It Works Section */}
        <div className="mb-16">
          <h3 className={`text-3xl md:text-4xl font-bold mb-12 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            How It Works
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                description: 'Your data is secured in your private vault',
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: DollarSign,
                title: 'Monetize Your Memories',
                description: 'Choose to sell valuable insights anonymously',
                color: 'from-green-500 to-emerald-500'
              }
            ].map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="relative mb-6">
                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${step.color} shadow-2xl transition-all duration-300 group-hover:scale-110`}>
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg bg-gradient-to-br ${step.color}`}>
                      {index + 1}
                    </div>
                  </div>
                  <h4 className={`text-xl font-bold mb-3 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {step.title}
                  </h4>
                  <p className={`text-base ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Why ChainSpeak Section */}
        <div className="mb-16">
          <h3 className={`text-3xl md:text-4xl font-bold mb-12 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Why ChainSpeak?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Private by Default',
                description: 'No accounts, no names, no tracking. Complete anonymity.',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: Brain,
                title: 'AI-Powered Chat',
                description: 'Your own GPT-style voice space without data harvesting.',
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: DollarSign,
                title: 'Sellable Memory Logs',
                description: 'You control the resale of your anonymized data.',
                color: 'from-green-500 to-emerald-500'
              }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className={`p-8 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                    darkMode 
                      ? 'bg-gray-800/80 border-gray-700' 
                      : 'bg-white/80 border-gray-200'
                  }`}
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} shadow-lg mb-6`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className={`text-xl font-bold mb-4 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {feature.title}
                  </h4>
                  <p className={`text-base ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Emotion Hook Section */}
        <div className="mb-16">
          <h3 className={`text-4xl md:text-5xl font-bold mb-8 leading-tight ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Have you ever wanted to say something...
            <br />
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              but couldn't?
            </span>
          </h3>
          
          <p className={`text-xl md:text-2xl mb-8 ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            ChainSpeak gives you the space to <span className="font-semibold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">unmask your mind</span>.
            <br />
            With anonymity, privacy, and the freedom to just be real.
          </p>

          {/* Mock Message Box */}
          <div className={`max-w-2xl mx-auto p-6 rounded-2xl backdrop-blur-sm border shadow-2xl ${
            darkMode 
              ? 'bg-gray-800/80 border-gray-700' 
              : 'bg-white/80 border-gray-200'
          }`}>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div className={`flex-1 p-3 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    "I've been thinking about this idea for months but never felt safe sharing it..."
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 justify-end">
                <div className="flex-1 max-w-xs p-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  <p className="text-sm">
                    "This is your safe space. Share freely - your thoughts are protected here."
                  </p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <h3 className={`text-4xl md:text-5xl font-bold mb-6 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            It's your mind. Your memories.
            <br />
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Your data.
            </span>
          </h3>
          
          <p className={`text-xl mb-8 ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Take the power back.
          </p>

          <button
            onClick={onGetStarted}
            className="group relative px-16 py-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-2xl font-bold rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700"></div>
            <span className="relative z-10">Start Now</span>
          </button>

          <p className={`mt-6 text-sm ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            No sign-up required • Start chatting instantly • Your privacy guaranteed
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;