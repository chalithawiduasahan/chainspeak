import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Eye, DollarSign, Calendar, User, UserX, ToggleLeft, ToggleRight } from 'lucide-react';
import { marketplaceService, MarketplaceListing } from '../../services/marketplaceService';
import ConfirmationModal from './ConfirmationModal';

interface MyListingsTabProps {
  darkMode: boolean;
  userProfile?: any;
  triggerDataRefresh?: () => void;
}

const MyListingsTab: React.FC<MyListingsTabProps> = ({ darkMode, userProfile, triggerDataRefresh }) => {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingListing, setEditingListing] = useState<MarketplaceListing | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    price: '',
    tags: '',
    is_anonymous: false
  });
  const [updating, setUpdating] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'purchase' | 'edit' | 'delete' | 'list' | 'unlist';
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    type: 'edit',
    title: '',
    message: '',
    onConfirm: () => {}
  });

  useEffect(() => {
    if (userProfile?.id) {
      loadUserListings();
    }
  }, [userProfile]);

  const loadUserListings = async () => {
    try {
      setLoading(true);
      const data = await marketplaceService.getUserListings(userProfile.id);
      setListings(data);
    } catch (error) {
      console.error('Failed to load user listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (listing: MarketplaceListing) => {
    setEditingListing(listing);
    setEditForm({
      title: listing.title,
      description: listing.description,
      price: listing.price.toString(),
      tags: listing.tags.join(', '),
      is_anonymous: listing.is_anonymous
    });
  };

  const handleUpdateClick = () => {
    if (!editingListing) return;

    setConfirmModal({
      isOpen: true,
      type: 'edit',
      title: 'Confirm Changes',
      message: `Are you sure you want to update the listing "${editForm.title}"?`,
      onConfirm: handleUpdate
    });
  };

  const handleUpdate = async () => {
    if (!editingListing) return;

    try {
      setUpdating(true);
      
      const tags = editForm.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const result = await marketplaceService.updateListing(editingListing.id, {
        title: editForm.title,
        description: editForm.description,
        price: parseFloat(editForm.price) || 0,
        tags: tags,
        is_anonymous: editForm.is_anonymous
      });

      if (result.success) {
        setConfirmModal({
          isOpen: true,
          type: 'edit',
          title: 'Update Successful!',
          message: 'Your listing has been updated successfully!',
          onConfirm: () => {
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
            setEditingListing(null);
            loadUserListings();
            // Trigger data refresh for other components
            if (triggerDataRefresh) {
              triggerDataRefresh();
              console.log('🔄 Data refresh triggered after listing update');
            }
          }
        });
      } else {
        setConfirmModal({
          isOpen: true,
          type: 'edit',
          title: 'Update Failed',
          message: result.error || 'Failed to update listing. Please try again.',
          onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
        });
      }
    } catch (error) {
      console.error('Error updating listing:', error);
      setConfirmModal({
        isOpen: true,
        type: 'edit',
        title: 'Update Failed',
        message: 'An error occurred while updating your listing. Please try again.',
        onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleActive = async (listing: MarketplaceListing) => {
    try {
      const result = await marketplaceService.updateListing(listing.id, {
        is_active: !listing.is_active
      });

      if (result.success) {
        loadUserListings();
        // Trigger data refresh for other components
        if (triggerDataRefresh) {
          triggerDataRefresh();
          console.log('🔄 Data refresh triggered after listing toggle');
        }
      } else {
        setConfirmModal({
          isOpen: true,
          type: 'edit',
          title: 'Update Failed',
          message: result.error || 'Failed to update listing status. Please try again.',
          onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
        });
      }
    } catch (error) {
      console.error('Error toggling listing status:', error);
      setConfirmModal({
        isOpen: true,
        type: 'edit',
        title: 'Update Failed',
        message: 'An error occurred while updating the listing status. Please try again.',
        onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
      });
    }
  };

  const handleDeleteClick = (listing: MarketplaceListing) => {
    setConfirmModal({
      isOpen: true,
      type: 'unlist',
      title: 'Remove Listing',
      message: `Are you sure you want to remove "${listing.title}" from the marketplace? This action cannot be undone.`,
      onConfirm: () => handleDelete(listing)
    });
  };

  const handleDelete = async (listing: MarketplaceListing) => {
    try {
      const result = await marketplaceService.deleteListing(listing.id);

      if (result.success) {
        setConfirmModal({
          isOpen: true,
          type: 'unlist',
          title: 'Listing Removed!',
          message: 'Your listing has been successfully removed from the marketplace.',
          onConfirm: () => {
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
            loadUserListings();
            // Trigger data refresh for other components
            if (triggerDataRefresh) {
              triggerDataRefresh();
              console.log('🔄 Data refresh triggered after listing deletion');
            }
          }
        
        });
      } else {
        setConfirmModal({
          isOpen: true,
          type: 'unlist',
          title: 'Removal Failed',
          message: result.error || 'Failed to remove listing. Please try again.',
          onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
        });
      }
    } catch (error) {
      console.error('Error removing listing:', error);
      setConfirmModal({
        isOpen: true,
        type: 'unlist',
        title: 'Removal Failed',
        message: 'An error occurred while removing your listing. Please try again.',
        onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
      });
    }
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${price.toFixed(2)}`;
  };

  if (!userProfile?.id) {
    return (
      <div className="text-center py-16">
        <div className={`mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          <User className="w-16 h-16 mx-auto" />
        </div>
        <h3 className={`text-xl font-medium mb-2 ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Profile Required
        </h3>
        <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
          Please create a profile to manage your listings.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
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
      {/* Header */}
      <div className="text-center">
        <h2 className={`text-2xl font-bold mb-2 ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          My Listings
        </h2>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Manage your marketplace listings
        </p>
      </div>

      {/* Listings */}
      {listings.length === 0 ? (
        <div className="text-center py-16">
          <div className={`mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            <DollarSign className="w-16 h-16 mx-auto" />
          </div>
          <h3 className={`text-xl font-medium mb-2 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            No listings yet
          </h3>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            Go to "Sell Your Chats" to create your first listing.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing, index) => (
            <div
              key={listing.id}
              className={`border rounded-xl p-6 transition-all duration-300 ${
                darkMode 
                  ? 'border-gray-600 bg-gray-700/80' 
                  : 'border-gray-200 bg-white/80'
              } ${!listing.is_active ? 'opacity-60' : ''}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                <div className="flex-1 space-y-3">
                  {/* Title and Status */}
                  <div className="flex items-center space-x-3">
                    <h3 className={`text-lg font-semibold ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {listing.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      listing.is_active
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : darkMode
                          ? 'bg-gray-900/20 text-gray-300 border border-gray-600'
                          : 'bg-gray-100 text-gray-600 border border-gray-300'
                    }`}>
                      {listing.is_active ? 'Active' : 'Inactive'}
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
                          <span>Public</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className={`text-sm ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {listing.description || 'No description provided.'}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {listing.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`px-2 py-1 text-xs rounded-full ${
                          darkMode 
                            ? 'bg-gray-600 text-gray-300' 
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Metadata */}
                  <div className={`flex items-center space-x-4 text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-medium">{formatPrice(listing.price)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Listed {new Date(listing.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 mt-4 md:mt-0 md:ml-4">
                  <button
                    onClick={() => handleToggleActive(listing)}
                    className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                      listing.is_active
                        ? darkMode
                          ? 'text-green-400 hover:bg-gray-600'
                          : 'text-green-600 hover:bg-green-50'
                        : darkMode
                          ? 'text-gray-400 hover:bg-gray-600'
                          : 'text-gray-500 hover:bg-gray-50'
                    }`}
                    title={listing.is_active ? 'Deactivate listing' : 'Activate listing'}
                  >
                    {listing.is_active ? (
                      <ToggleRight className="w-5 h-5" />
                    ) : (
                      <ToggleLeft className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(listing)}
                    className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                      darkMode 
                        ? 'text-blue-400 hover:bg-gray-600' 
                        : 'text-blue-600 hover:bg-blue-50'
                    }`}
                    title="Edit listing"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(listing)}
                    className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                      darkMode 
                        ? 'text-red-400 hover:bg-gray-600' 
                        : 'text-red-600 hover:bg-red-50'
                    }`}
                    title="Remove listing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingListing && (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
    <div className="min-h-screen flex items-start justify-center p-2 md:p-4 pt-4 md:pt-8 pb-4 md:pb-8">
      <div className={`rounded-xl w-full max-w-lg transition-all duration-300 shadow-2xl max-h-[95vh] overflow-y-auto mx-2 md:mx-4 ${
        darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-inherit z-10">
          <h2 className={`text-lg md:text-xl font-bold pr-8 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Edit Listing
          </h2>
          <button
            onClick={() => setEditingListing(null)}
            className={`absolute top-4 right-4 p-1.5 md:p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
              darkMode 
                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <X className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 space-y-4 md:space-y-6 flex-1">
          {/* Title */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Title
            </label>
            <input
              type="text"
              value={editForm.title}
              onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
             className={`w-full border rounded-xl px-3 md:px-4 py-2.5 md:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:shadow-sm ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* Description */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Description
            </label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
             rows={2}
             className={`w-full border rounded-xl px-3 md:px-4 py-2.5 md:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:shadow-sm resize-none ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* Price and Tags */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Price ($)
              </label>
              <input
                type="number"
                value={editForm.price}
                onChange={(e) => setEditForm(prev => ({ ...prev, price: e.target.value }))}
                min="0"
                step="0.01"
               className={`w-full border rounded-xl px-3 md:px-4 py-2.5 md:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:shadow-sm ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Tags
              </label>
              <input
                type="text"
                value={editForm.tags}
                onChange={(e) => setEditForm(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="ai, tech, business"
               className={`w-full border rounded-xl px-3 md:px-4 py-2.5 md:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:shadow-sm ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          </div>

          {/* Anonymous Toggle - FIXED COLORS */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setEditForm(prev => ({ ...prev, is_anonymous: !prev.is_anonymous }))}
              className={`flex items-center space-x-2 px-3 md:px-4 py-2 md:py-3 border rounded-xl transition-all duration-300 hover:scale-105 ${
                editForm.is_anonymous
                  ? darkMode
                    ? 'border-purple-400 bg-purple-500/20 text-purple-200'
                    : 'border-purple-500 bg-purple-50 text-purple-700'
                  : darkMode
                    ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200 hover:bg-cyan-500/30'
                    : 'border-cyan-500 bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
              }`}
            >
              {editForm.is_anonymous ? (
                <>
                  <UserX className="w-4 h-4" />
                  <span className="text-sm">Anonymous</span>
                </>
              ) : (
                <>
                  <User className="w-4 h-4" />
                  <span className="text-sm">Show username</span>
                </>
              )}
            </button>
          </div>
        </div>
        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 md:p-6 sticky bottom-0 bg-inherit">
          <div className="flex space-x-3">
            <button
              onClick={() => setEditingListing(null)}
              disabled={updating}
              className={`flex-1 px-4 md:px-6 py-2.5 md:py-3 border rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md disabled:opacity-50 ${
                darkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateClick}
              disabled={!editForm.title || updating}
              className="flex-1 px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2"
            >
              {updating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4" />
                  <span>Update Listing</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
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
        loading={updating}
      />
    </div>
  );
};

export default MyListingsTab;