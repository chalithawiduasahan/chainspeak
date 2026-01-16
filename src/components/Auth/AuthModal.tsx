import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, CheckCircle, Edit } from 'lucide-react';
import { authService } from '../../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
  darkMode: boolean;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess, darkMode }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    fullName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        // Validation
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        if (!formData.nickname.trim()) {
          throw new Error('Nickname is required');
        }

        const result = await authService.signUp({
          email: formData.email,
          password: formData.password,
          nickname: formData.nickname,
          fullName: formData.fullName
        });
        
        // Check if user needs email verification
        if (result && result.needsVerification) {
          setVerificationEmail(formData.email);
          setShowVerificationModal(true);
        } else if (result && result.user) {
          onSuccess(result.user);
        }
      } else {
        const user = await authService.signIn({
          email: formData.email,
          password: formData.password
        });
        
        onSuccess(user);
      }
    } catch (error: any) {
      // Check if it's an email verification related error
      if (error.message && error.message.includes('email')) {
        setVerificationEmail(formData.email);
        setShowVerificationModal(true);
      } else {
        setError(error.message || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  // OAuth removed - using username-only authentication
  // const handleGoogleAuth = async () => {
  //   // OAuth functionality removed
  // };

  const handleResendVerification = async () => {
    try {
      setLoading(true);
      await authService.resendVerification(verificationEmail);
      // Show success message or update UI
    } catch (error: any) {
      setError(error.message || 'Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  };

  const handleEditEmail = () => {
    setShowVerificationModal(false);
    setFormData(prev => ({ ...prev, email: verificationEmail }));
  };

  // Verification Modal Component
  const VerificationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-start justify-center p-4 pt-8 pb-8 overflow-y-auto">
      <div className={`rounded-2xl w-full max-w-md transition-all duration-300 shadow-2xl transform mx-4 my-auto min-h-0 max-h-[90vh] overflow-y-auto ${
        darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <h2 className={`text-xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Check Your Email
            </h2>
          </div>
          <button
            onClick={() => {
              setShowVerificationModal(false);
              onClose();
            }}
            className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
              darkMode 
                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Verification Email Sent!
            </h3>
            <p className={`text-base leading-relaxed ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              We've sent a verification email to:
            </p>
            <div className={`mt-2 p-3 rounded-lg border ${
              darkMode 
                ? 'bg-blue-900/20 border-blue-700 text-blue-200' 
                : 'bg-blue-50 border-blue-200 text-blue-700'
            }`}>
              <div className="flex items-center justify-center space-x-2">
                <Mail className="w-4 h-4" />
                <span className="font-medium">{verificationEmail}</span>
              </div>
            </div>
          </div>

          <div className={`rounded-xl p-4 border mb-6 ${
            darkMode 
              ? 'bg-gray-700/50 border-gray-600' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <h4 className={`font-medium mb-2 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Next Steps:
            </h4>
            <ol className={`text-sm space-y-1 ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <li>1. Check your email inbox (and spam folder)</li>
              <li>2. Click the verification link in the email</li>
              <li>3. Return here to sign in</li>
            </ol>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleEditEmail}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-3 border rounded-xl transition-all duration-300 hover:scale-105 ${
                darkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Edit className="w-4 h-4" />
              <span>Wrong email? Edit and try again</span>
            </button>

            <button
              onClick={handleResendVerification}
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 shadow-lg font-medium"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Resending...</span>
                </div>
              ) : (
                'Resend verification email'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center p-4 pt-8 pb-8 overflow-y-auto">
        <div className={`rounded-2xl w-full max-w-md transition-all duration-300 shadow-2xl transform mx-4 my-auto min-h-0 max-h-[90vh] overflow-y-auto ${
          darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-inherit z-10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <h2 className={`text-xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 disabled:opacity-50 ${
                darkMode 
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-4 md:p-6">
            <div className="space-y-3 md:space-y-4">
              {/* OAuth removed - using username-only authentication */}

              {/* Email */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    className={`w-full pl-10 pr-4 py-2.5 md:py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 disabled:opacity-50 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Sign Up Fields */}
              {isSignUp && (
                <>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Nickname
                    </label>
                    <input
                      type="text"
                      name="nickname"
                      value={formData.nickname}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                      className={`w-full px-4 py-2.5 md:py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 disabled:opacity-50 ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="Choose a nickname"
                    />
                  </div>
                </>
              )}

              {/* Password */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    className={`w-full pl-10 pr-12 py-2.5 md:py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 disabled:opacity-50 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (Sign Up only) */}
              {isSignUp && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                      className={`w-full pl-10 pr-12 py-2.5 md:py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 disabled:opacity-50 ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="rounded-xl p-4 bg-red-900/20 border border-red-700">
                  <p className="text-sm text-red-200">
                    {error}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-2.5 md:py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 shadow-lg font-medium"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
                  </div>
                ) : (
                  <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                )}
              </button>

              {/* Toggle Sign Up/Sign In */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError(null);
                    setFormData({
                      email: '',
                      password: '',
                      confirmPassword: '',
                      nickname: '',
                      fullName: ''
                    });
                  }}
                  disabled={loading}
                  className={`text-sm transition-colors duration-300 hover:underline disabled:opacity-50 ${
                    darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                  }`}
                >
                  {isSignUp 
                    ? 'Already have an account? Sign in' 
                    : "Don't have an account? Sign up"
                  }
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Verification Modal */}
      {showVerificationModal && <VerificationModal />}
    </>
  );
};

export default AuthModal;