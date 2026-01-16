import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, Hash, Calendar } from 'lucide-react';
import { blockchainChatService } from '../../services/blockchainChatService';
import { getMostDiscussedTopic } from '../../services/blockchainChatService';
import { getWeeklyActivityWithLastWeek } from '../../services/blockchainChatService';
import { getWeeklyActivitySeconds } from '../../services/userActivityService';

interface AnalyticsTabProps {
  darkMode: boolean;
  userProfile?: any;
  dataRefreshKey?: number;
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ darkMode, userProfile, dataRefreshKey = 0 }) => {
  const [lastWeekConversations, setLastWeekConversations] = useState(0);
  const [analytics, setAnalytics] = useState({
    weeklyConversations: 0,
    peakActivityTime: 'No activity yet',
    topKeywords: [],
    productivityScore: 0,
    weeklyActivity: [
      { day: 'Mon', count: 0 },
      { day: 'Tue', count: 0 },
      { day: 'Wed', count: 0 },
      { day: 'Thu', count: 0 },
      { day: 'Fri', count: 0 },
      { day: 'Sat', count: 0 },
      { day: 'Sun', count: 0 }
    ],
    mostDiscussedTopic: 'No topics yet'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!userProfile?.id) {
        console.log('AnalyticsTab: No user profile ID, setting loading to false');
        setLoading(false);
        return;
      }

      try {
        console.log('AnalyticsTab: Loading analytics for user:', userProfile.id);
        setLoading(true);
        
        // Get weekly activity in seconds from user_activity table
        console.log('AnalyticsTab: Fetching weekly activity seconds...');
        const weeklyActivityRaw = await getWeeklyActivitySeconds(userProfile.id);
        console.log('AnalyticsTab: Raw weekly activity data:', weeklyActivityRaw);

        // Get current week start (Monday) in local timezone
        const now = new Date();
        const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1; // Sunday = 6 days from Monday
        const mondayOfThisWeek = new Date(now);
        mondayOfThisWeek.setDate(now.getDate() - daysFromMonday);
        mondayOfThisWeek.setHours(0, 0, 0, 0);

        console.log('AnalyticsTab: Current week Monday:', mondayOfThisWeek.toDateString());
        console.log('AnalyticsTab: Today:', now.toDateString(), 'Day of week:', currentDay);

        // Process the weekly activity data to ensure correct day mapping and week filtering
        const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const weeklyActivity = [];

        // Initialize all days to 0
        for (let i = 0; i < 7; i++) {
          weeklyActivity.push({ day: dayNames[i], count: 0 });
        }

        // Process each data point
        weeklyActivityRaw.forEach(({ date, seconds_spent }) => {
          const dateObj = new Date(date + 'T00:00:00'); // Ensure local timezone
          
          // Check if this date is in the current week (from Monday onwards)
          if (dateObj >= mondayOfThisWeek) {
            // Get day index: Monday = 0, Tuesday = 1, ..., Sunday = 6
            let dayIndex = dateObj.getDay();
            if (dayIndex === 0) {
              dayIndex = 6; // Sunday becomes index 6
            } else {
              dayIndex = dayIndex - 1; // Monday(1) becomes 0, Tuesday(2) becomes 1, etc.
            }
            
            const day = dayNames[dayIndex];
            const minutes = Math.round(seconds_spent / 60);
            
            console.log(`AnalyticsTab: Processing ${date} -> ${dateObj.toDateString()} (JS day: ${dateObj.getDay()}) -> ${day} (index: ${dayIndex}): ${seconds_spent} seconds = ${minutes} minutes`);
            
            // Update the corresponding day
            weeklyActivity[dayIndex] = { day, count: minutes };
          } else {
            console.log(`AnalyticsTab: Skipping ${date} as it's before current week start`);
          }
        });

        console.log('AnalyticsTab: Processed weekly activity:', weeklyActivity);
        
        // Get top keywords
        console.log('AnalyticsTab: Fetching top keywords...');
        const topKeywords = await blockchainChatService.getTopKeywords(userProfile.id);
        console.log('AnalyticsTab: Top keywords:', topKeywords);
        
        // Get peak activity time
        console.log('AnalyticsTab: Fetching peak activity time...');
        const peakActivityTime = await blockchainChatService.getPeakActivityTime(userProfile.id);
        console.log('AnalyticsTab: Peak activity time:', peakActivityTime);
        
        // Get productivity metrics
        console.log('AnalyticsTab: Fetching productivity metrics...');
        const productivityMetrics = await blockchainChatService.getProductivityMetrics(userProfile.id);
        console.log('AnalyticsTab: Productivity metrics:', productivityMetrics);

        // Get most discussed topic
        console.log('AnalyticsTab: Fetching most discussed topic...');
        const mostDiscussedTopic = await getMostDiscussedTopic(userProfile.id);
        console.log('AnalyticsTab: Most discussed topic:', mostDiscussedTopic);

        // Get weekly conversations (number of conversations this week and last week)
        console.log('AnalyticsTab: Fetching weekly conversations...');
        const { thisWeek, lastWeek } = await getWeeklyActivityWithLastWeek(userProfile.id);
        const weeklyConversations = thisWeek.reduce((sum, d) => sum + d.count, 0);
        const lastWeekConversations = lastWeek.reduce((sum, d) => sum + d.count, 0);
        console.log('AnalyticsTab: Weekly conversations - this week:', weeklyConversations, 'last week:', lastWeekConversations);

        const newAnalytics = {
          weeklyConversations,
          peakActivityTime,
          topKeywords: topKeywords.slice(0, 6), // Top 6 keywords
          productivityScore: productivityMetrics.totalScore,
          weeklyActivity,
          mostDiscussedTopic
        };

        console.log('AnalyticsTab: Setting final analytics state:', newAnalytics);
        setAnalytics(newAnalytics);
        setLastWeekConversations(lastWeekConversations);

      } catch (error) {
        console.error('AnalyticsTab: Error loading analytics:', error);
      } finally {
        setLoading(false);
        console.log('AnalyticsTab: Loading complete');
      }
    };

    loadAnalytics();
  }, [userProfile?.id, dataRefreshKey]);

  const stats = [
    {
      label: 'Most Discussed Topic',
      value: analytics.mostDiscussedTopic || 'No topics yet',
      icon: Hash,
      change: analytics.mostDiscussedTopic !== 'No topics yet' ? `Most chats about ${analytics.mostDiscussedTopic}` : 'Start chatting',
      color: 'from-blue-500 to-purple-500'
    },
    {
      label: 'Peak Activity Time',
      value: analytics.peakActivityTime,
      icon: Clock,
      change: 'Consistent pattern',
      color: 'from-green-500 to-teal-500'
    },
    {
      label: 'Weekly Conversations',
      value: analytics.weeklyConversations,
      icon: Calendar,
      change:
        typeof lastWeekConversations === 'number'
          ? analytics.weeklyConversations === lastWeekConversations
            ? 'Same as last week'
            : analytics.weeklyConversations > lastWeekConversations
              ? `${analytics.weeklyConversations - lastWeekConversations} more than last week`
              : `${lastWeekConversations - analytics.weeklyConversations} less than last week`
          : 'No data for last week',
      color: 'from-orange-500 to-red-500'
    },
    {
      label: 'Productivity Score',
      value: `${analytics.productivityScore}/100`,
      icon: TrendingUp,
      change: analytics.productivityScore > 0 ? `${analytics.productivityScore} points` : 'Start chatting',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  if (loading) {
    console.log('AnalyticsTab: Rendering loading state');
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`animate-pulse p-6 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div className={`h-4 rounded mb-2 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
              <div className={`h-3 rounded w-3/4 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  console.log('AnalyticsTab: Rendering analytics with weekly activity:', analytics.weeklyActivity);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className={`backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border ${
                darkMode 
                  ? 'bg-gray-700/80 border-gray-600' 
                  : 'bg-white/80 border-gray-100'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl shadow-lg`}>
                  <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <span className={`text-sm font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {stat.label}
                </span>
              </div>
              <div className={`text-xl md:text-2xl font-bold mb-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {stat.value}
              </div>
              <div className="text-sm text-green-600 font-medium">{stat.change}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <div className={`backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-lg border transition-colors duration-300 ${
          darkMode 
            ? 'bg-gray-700/80 border-gray-600' 
            : 'bg-white/80 border-gray-100'
        }`}>
          <h3 className={`text-lg font-semibold mb-6 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Top Keywords
          </h3>
          <div className="space-y-4">
            {analytics.topKeywords.length > 0 ? (
              analytics.topKeywords.map((keyword, index) => {
                const maxCount = analytics.topKeywords[0]?.count || 1;
                const percentage = (keyword.count / maxCount) * 100;
                const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-red-500', 'bg-pink-500'];
                
                return (
                  <div key={index} className="flex items-center justify-between group">
                    <span className={`font-medium capitalize ${
                      darkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      {keyword.word}
                    </span>
                    <div className="flex items-center space-x-3">
                      <div className={`w-24 md:w-32 rounded-full h-3 overflow-hidden ${
                        darkMode ? 'bg-gray-600' : 'bg-gray-200'
                      }`}>
                        <div 
                          className={`${colors[index % colors.length]} h-3 rounded-full transition-all duration-1000 ease-out`}
                          style={{ 
                            width: `${percentage}%`,
                            animationDelay: `${index * 200}ms`
                          }}
                        ></div>
                      </div>
                      <span className={`text-sm w-8 text-right font-medium ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {keyword.count}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Start conversations to see your top keywords
                </p>
              </div>
            )}
          </div>
        </div>

        <div className={`backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-lg border transition-colors duration-300 ${
          darkMode 
            ? 'bg-gray-700/80 border-gray-600' 
            : 'bg-white/80 border-gray-100'
        }`}>
          <h3 className={`text-lg font-semibold mb-16 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Weekly Activity (Minutes)
          </h3>
          <div className="h-48 flex items-end justify-between space-x-2 md:space-x-3 mb-4">
            {analytics.weeklyActivity.map((day, index) => {
              const maxCount = Math.max(...analytics.weeklyActivity.map(d => d.count), 1);
              // Calculate height as percentage of the maximum value
              const height = day.count > 0 ? (day.count / maxCount) * 100 : 0;
              
              console.log(`AnalyticsTab: Rendering bar for ${day.day}, count = ${day.count}, max count = ${maxCount}, height ${height}%`);
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className={`w-full rounded-t-lg relative overflow-hidden transition-all duration-1000 ease-out ${
                    darkMode ? 'bg-gray-600' : 'bg-gray-100'
                  }`} style={{ height: '192px' }}>
                    {day.count > 0 && (
                      <div 
                        className="bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg w-full absolute bottom-0 transition-all duration-1000 ease-out flex items-start justify-center"
                        style={{ 
                          height: `${Math.max(height, 8)}%`, // Minimum 8% height for visibility
                          animationDelay: `${index * 150}ms`
                        }}
                      >
                        {/* Only show text if there's enough space and the value is significant */}
                        {height > 15 && day.count > 0 && (
                          <div className="text-xs text-white font-bold mt-2 px-1 text-center leading-tight">
                            {day.count}m
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className={`text-xs mt-3 font-medium ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {day.day}
                  </div>
                  {/* Show value below the day label if not shown in the bar */}
                  {day.count > 0 && height <= 15 && (
                    <div className={`text-xs mt-1 font-bold ${
                      darkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      {day.count}m
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="text-center">
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Time spent on ChainSpeak this week
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;