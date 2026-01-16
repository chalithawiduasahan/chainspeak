import React, { useState, useEffect } from 'react';
import { Search, Filter, ShoppingBag, Star, Bot, Eye, DollarSign, User, UserX } from 'lucide-react';
import { marketplaceService, MarketplaceListing } from '../../services/marketplaceService';
import ConfirmationModal from './ConfirmationModal';

interface MarketplaceTabProps {
  darkMode: boolean;
  userProfile?: any;
  triggerDataRefresh?: () => void;
}

const MarketplaceTab: React.FC<MarketplaceTabProps> = ({ darkMode, userProfile, triggerDataRefresh }) => {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'purchase' | 'edit' | 'delete' | 'list' | 'unlist';
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    type: 'purchase',
    title: '',
    message: '',
    onConfirm: () => {}
  });

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      setLoading(true);
      const filters = {
        search: searchQuery,
        minPrice: priceRange.min ? parseFloat(priceRange.min) : undefined,
        maxPrice: priceRange.max ? parseFloat(priceRange.max) : undefined,
        tags: selectedTags
      };
      const data = await marketplaceService.getAllListings(filters);
      setListings(data);
    } catch (error) {
      console.error('Failed to load listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadListings();
  };

  const handlePurchaseClick = (listing: MarketplaceListing) => {
    if (!userProfile?.id) {
      setConfirmModal({
        isOpen: true,
        type: 'purchase',
        title: 'Profile Required',
        message: 'Please create a profile to purchase chats.',
        onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
      });
      return;
    }

    setConfirmModal({
      isOpen: true,
      type: 'purchase',
      title: 'Confirm Purchase',
      message: `Are you sure you want to purchase "${listing.title}" for ${listing.price === 0 ? 'free' : `$${listing.price.toFixed(2)}`}?`,
      onConfirm: () => handlePurchase(listing)
    });
  };

  const handlePurchase = async (listing: MarketplaceListing) => {
    try {
      setPurchasing(listing.id);
      const result = await marketplaceService.purchaseChat({
        buyerUserId: userProfile.id,
        buyerUsername: userProfile.nickname,
        listingId: listing.id
      });

      if (result.success) {
        setConfirmModal({
          isOpen: true,
          type: 'purchase',
          title: 'Purchase Successful!',
          message: result.message || 'Purchase completed successfully! You can access your purchased chat in the "Bought Chats" section.',
          onConfirm: () => {
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
            loadListings(); // Refresh listings
            // Trigger data refresh for other components
            if (triggerDataRefresh) {
              triggerDataRefresh();
              console.log('🔄 Data refresh triggered after purchase');
            }
          }
        });
      } else {
        setConfirmModal({
          isOpen: true,
          type: 'purchase',
          title: 'Purchase Failed',
          message: result.error || 'Failed to purchase chat. Please try again.',
          onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
        });
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setConfirmModal({
        isOpen: true,
        type: 'purchase',
        title: 'Purchase Failed',
        message: 'An error occurred while processing your purchase. Please try again.',
        onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
      });
    } finally {
      setPurchasing(null);
    }
  };

  const getCategoryColor = (tags: string[]) => {
    if (tags.includes('technology') || tags.includes('ai')) return 'from-blue-500 to-cyan-500';
    if (tags.includes('business')) return 'from-green-500 to-emerald-500';
    if (tags.includes('marketing')) return 'from-orange-500 to-red-500';
    if (tags.includes('design')) return 'from-pink-500 to-rose-500';
    if (tags.includes('finance')) return 'from-yellow-500 to-amber-500';
    return 'from-purple-500 to-violet-500';
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${price.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className={`h-12 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className={`animate-pulse p-6 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div className={`h-4 rounded mb-2 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
            <div className={`h-3 rounded w-3/4 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search conversations by topic, keywords, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:shadow-md ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-3 border rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md ${
              darkMode 
                ? 'border-gray-600 hover:bg-gray-700 text-gray-300' 
                : 'border-gray-300 hover:bg-gray-50 text-gray-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            Search
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className={`p-4 rounded-xl transition-all duration-300 ${
            darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Min Price ($)
                </label>
                <input
                  type="number"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  placeholder="0"
                  className={`w-full border rounded-lg px-3 py-2 transition-all duration-300 hover:shadow-sm ${
                    darkMode 
                      ? 'bg-gray-600 border-gray-500 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Max Price ($)
                </label>
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  placeholder="1000"
                  className={`w-full border rounded-lg px-3 py-2 transition-all duration-300 hover:shadow-sm ${
                    darkMode 
                      ? 'bg-gray-600 border-gray-500 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Tags
                </label>
                <input
                  type="text"
                  placeholder="ai, business, tech..."
                  onChange={(e) => setSelectedTags(e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                  className={`w-full border rounded-lg px-3 py-2 transition-all duration-300 hover:shadow-sm ${
                    darkMode 
                      ? 'bg-gray-600 border-gray-500 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Demo Notice */}
      <div className={`rounded-xl p-4 border ${
        darkMode 
          ? 'bg-blue-900/20 border-blue-700 text-blue-300' 
          : 'bg-blue-50 border-blue-200 text-blue-700'
      }`}>
        <div className="flex items-center space-x-2">
          <DollarSign className="w-5 h-5" />
          <span className="font-medium">Demo Mode:</span>
          <span className="text-sm">Payments are simulated for demo purposes. No real money is required.</span>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing, index) => (
          <div
            key={listing.id}
            className={`border rounded-xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer backdrop-blur-sm hover:scale-105 group ${
              darkMode 
                ? 'border-gray-600 bg-gray-700/80 hover:bg-gray-700' 
                : 'border-gray-200 bg-white/80 hover:bg-white'
            }`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`text-sm font-medium px-3 py-1 rounded-full bg-gradient-to-r ${getCategoryColor(listing.tags)} text-white shadow-md`}>
                      {listing.tags[0] || 'General'}
                    </span>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      {listing.is_anonymous ? (
                        <>
                          <UserX className="w-3 h-3" />
                          <span>Anonymous</span>
                        </>
                      ) : (
                        <>
                          <User className="w-3 h-3" />
                          <span>{listing.seller_username}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <h3 className={`text-lg font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {listing.title}
                  </h3>
                </div>
                <div className="text-right ml-4">
                  <div className={`text-2xl font-bold ${
                    listing.price === 0 
                      ? 'text-green-600' 
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent'
                  }`}>
                    {formatPrice(listing.price)}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className={`text-sm line-clamp-3 leading-relaxed ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {listing.description || 'No description provided.'}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {listing.tags.slice(0, 4).map((tag) => (
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
                {listing.tags.length > 4 && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    darkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-100 text-gray-500'
                  }`}>
                    +{listing.tags.length - 4} more
                  </span>
                )}
              </div>

              {/* Metadata */}
              <div className={`flex items-center justify-between text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <div className="flex items-center space-x-2">
                  <Bot className="w-4 h-4" />
                  <span>AI Chat</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{new Date(listing.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Purchase Button */}
              <button
                onClick={() => handlePurchaseClick(listing)}
                disabled={purchasing === listing.id}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center space-x-2"
              >
                {purchasing === listing.id ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>{listing.price === 0 ? 'Get Free' : 'Purchase'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {listings.length === 0 && !loading && (
        <div className="text-center py-16">
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

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        darkMode={darkMode}
        loading={purchasing !== null}
      />
    </div>
  );
};

export default MarketplaceTab;