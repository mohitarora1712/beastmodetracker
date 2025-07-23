
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { calculateStreaks } from '@/utils/streakCalculations';

const StreakDisplay = () => {
  const [streakData, setStreakData] = useState({ currentStreak: 0, longestStreak: 0, totalDays: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStreakData();
  }, []);

  const loadStreakData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('streak_days')
        .select('date')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error loading streak data:', error);
        return;
      }

      const streakDates = (data || []).map(row => row.date);
      const streaks = calculateStreaks(streakDates);
      setStreakData(streaks);
    } catch (error) {
      console.error('Error loading streak data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-700">
        <div className="text-center text-gray-400">Loading stats...</div>
      </div>
    );
  }

  const { currentStreak, longestStreak, totalDays } = streakData;
  const progress = (totalDays / 30) * 100;

  // Generate fire emojis based on current streak
  const generateStreakFires = (streak: number) => {
    if (streak === 0) return '';
    const fireCount = Math.min(streak, 10); // Cap at 10 fires for display
    return '🔥'.repeat(fireCount) + ` x${streak} Days`;
  };

  return (
    <div className="bg-gray-800 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-700">
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 text-center">Beast Stats</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <div className="text-center bg-gray-700 rounded-lg p-3 sm:p-4">
          <div className="text-2xl sm:text-3xl font-bold text-orange-400 mb-1 sm:mb-2">{currentStreak}</div>
          <div className="text-gray-300 text-xs sm:text-sm uppercase tracking-wide">Current Streak</div>
          {currentStreak > 0 && (
            <div className="text-orange-300 text-xs sm:text-sm mt-1">
              {generateStreakFires(currentStreak)}
            </div>
          )}
        </div>
        
        <div className="text-center bg-gray-700 rounded-lg p-3 sm:p-4">
          <div className="text-2xl sm:text-3xl font-bold text-red-400 mb-1 sm:mb-2">{longestStreak}</div>
          <div className="text-gray-300 text-xs sm:text-sm uppercase tracking-wide">Longest Streak</div>
        </div>
        
        <div className="text-center bg-gray-700 rounded-lg p-3 sm:p-4">
          <div className="text-2xl sm:text-3xl font-bold text-green-400 mb-1 sm:mb-2">{totalDays}</div>
          <div className="text-gray-300 text-xs sm:text-sm uppercase tracking-wide">Total Days</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs sm:text-sm text-gray-300 mb-2">
          <span>30-Day Challenge Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 sm:h-3">
          <div 
            className="bg-gradient-to-r from-orange-500 to-red-500 h-2 sm:h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>
      </div>

      {progress >= 100 && (
        <div className="text-center bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-3 sm:p-4 mt-4">
          <div className="text-lg sm:text-2xl font-bold text-white">🏆 CHALLENGE COMPLETE!</div>
          <div className="text-orange-100 text-sm sm:text-base">You are a true Beast!</div>
        </div>
      )}
    </div>
  );
};

export default StreakDisplay;
