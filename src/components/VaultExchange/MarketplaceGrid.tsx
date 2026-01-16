import React from 'react';
import { Star, Bot, Eye, ShoppingBag } from 'lucide-react';

interface MarketplaceItem {
  id: string;
  title: string;
  price: number;
  rating: number;
  reviews: number;
  views: number;
  source: string;
  category: string;
  preview: string;
  tags: string[];
  seller: string;
}

interface MarketplaceGridProps {
  searchQuery: string;
  darkMode: boolean;
}

const MarketplaceGrid: React.FC<MarketplaceGridProps> = ({ searchQuery, darkMode }) => {
  const marketplaceItems: MarketplaceItem[] = [
    {
      id: '1',
      title: 'Complete React.js Learning Path',
      price: 89.99,
      rating: 4.8,
      reviews: 24,
      views: 156,
      source: 'GPT-4',
      category: 'Development',
      preview: 'Comprehensive conversation covering React fundamentals, hooks, state management, and best practices...',
      tags: ['react', 'javascript', 'frontend', 'development'],
      seller: 'TechExpert'
    },
    {
      id: '2',
      title: 'Startup Funding Strategy Deep Dive',
      price: 124.99,
      rating: 4.9,
      reviews: 18,
      views: 203,
      source: 'Claude',
      category: 'Business',
      preview: 'Expert insights on raising seed funding, investor relations, pitch deck optimization, and valuation strategies...',
      tags: ['startup', 'funding', 'investment', 'business'],
      seller: 'StartupGuru'
    },
    {
      id: '3',
      title: 'AI-Powered Marketing Automation',
      price: 67.50,
      rating: 4.7,
      reviews: 31,
      views: 89,
      source: 'ChatGPT',
      category: 'Marketing',
      preview: 'Advanced marketing automation techniques using AI tools, customer segmentation, and conversion optimization...',
      tags: ['marketing', 'automation', 'ai', 'growth'],
      seller: 'MarketingPro'
    },
    {
      id: '4',
      title: 'Python Data Science Masterclass',
      price: 95.00,
      rating: 4.9,
      reviews: 42,
      views: 278,
      source: 'GPT-4',
      category: 'Technology',
      preview: 'Complete guide to data science with Python, including pandas, numpy, machine learning, and visualization...',
      tags: ['python', 'data-science', 'machine-learning', 'analytics'],
      seller: 'DataScientist'
    },
    {
      id: '5',
      title: 'Cryptocurrency Investment Analysis',
      price: 156.00,
      rating: 4.6,
      reviews: 15,
      views: 124,
      source: 'Claude',
      category: 'Finance',
      preview: 'In-depth analysis of cryptocurrency markets, DeFi strategies, risk management, and portfolio optimization...',
      tags: ['crypto', 'investment', 'defi', 'finance'],
      seller: 'CryptoAnalyst'
    },
    {
      id: '6',
      title: 'UX Design Principles & Process',
      price: 78.99,
      rating: 4.8,
      reviews: 28,
      views: 167,
      source: 'ChatGPT',
      category: 'Design',
      preview: 'User experience design fundamentals, research methods, wireframing, prototyping, and usability testing...',
      tags: ['ux', 'design', 'user-research', 'prototyping'],
      seller: 'UXDesigner'
    }
  ];

  const filteredItems = marketplaceItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    const colors = {
      'Development': 'from-blue-500 to-cyan-500',
      'Business': 'from-green-500 to-emerald-500',
      'Marketing': 'from-orange-500 to-red-500',
      'Technology': 'from-purple-500 to-violet-500',
      'Finance': 'from-yellow-500 to-amber-500',
      'Design': 'from-pink-500 to-rose-500'
    };
    return colors[category as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {filteredItems.map((item, index) => (
        <div
          key={item.id}
          className={`border rounded-xl p-4 md:p-6 hover:shadow-xl transition-all duration-300 cursor-pointer backdrop-blur-sm hover:scale-105 group ${
            darkMode 
              ? 'border-gray-600 bg-gray-700/80 hover:bg-gray-700' 
              : 'border-gray-200 bg-white/80 hover:bg-white'
          }`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-sm font-medium px-3 py-1 rounded-full bg-gradient-to-r ${getCategoryColor(item.category)} text-white shadow-md`}>
                  {item.category}
                </span>
                <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  ${item.price}
                </span>
              </div>
              <h3 className={`text-lg font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {item.title}
              </h3>
            </div>

            <div className={`flex items-center justify-between text-sm ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Bot className="w-3 h-3 text-white" />
                </div>
                <span>{item.source}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{item.views}</span>
              </div>
            </div>

            <p className={`text-sm line-clamp-3 leading-relaxed ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {item.preview}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < Math.floor(item.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">{item.rating}</span>
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  ({item.reviews})
                </span>
              </div>
              <div className={`text-xs px-2 py-1 rounded-full ${
                darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-500'
              }`}>
                by {item.seller}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {item.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className={`px-2 py-1 text-xs rounded-full transition-all duration-300 ${
                    darkMode 
                      ? 'bg-gradient-to-r from-gray-600 to-gray-500 text-gray-200 hover:from-blue-600 hover:to-purple-600' 
                      : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-blue-100 hover:to-purple-100'
                  }`}
                >
                  {tag}
                </span>
              ))}
              {item.tags.length > 3 && (
                <span className={`px-2 py-1 text-xs rounded-full ${
                  darkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-100 text-gray-500'
                }`}>
                  +{item.tags.length - 3} more
                </span>
              )}
            </div>

            <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center space-x-2">
              <ShoppingBag className="w-4 h-4" />
              <span>Purchase Conversation</span>
            </button>
          </div>
        </div>
      ))}

      {filteredItems.length === 0 && (
        <div className="col-span-full text-center py-16">
          <div className={`mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            <ShoppingBag className="w-16 h-16 mx-auto" />
          </div>
          <h3 className={`text-xl font-medium mb-2 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            No conversations found
          </h3>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            Try adjusting your search terms or browse different categories.
          </p>
        </div>
      )}
    </div>
  );
};

export default MarketplaceGrid;