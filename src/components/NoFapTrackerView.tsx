
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { toast } from '@/hooks/use-toast';
import { saveMasturbationEntry, getMasturbationEntry, getMasturbationHistory, getTodayString } from '@/utils/supabaseStorage';
import { format, parseISO, differenceInDays } from 'date-fns';

const NoFapTrackerView = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [todayStatus, setTodayStatus] = useState<boolean | null>(null);
  const [selectedDateStatus, setSelectedDateStatus] = useState<boolean | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [totalRelapses, setTotalRelapses] = useState(0);
  const [totalCleanDays, setTotalCleanDays] = useState(0);
  const [totalDaysTracked, setTotalDaysTracked] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadSelectedDateStatus();
  }, [selectedDate]);

  const loadData = async () => {
    try {
      const [todayEntry, historyData] = await Promise.all([
        getMasturbationEntry(getTodayString()),
        getMasturbationHistory()
      ]);

      setTodayStatus(todayEntry?.masturbated || false);
      setHistory(historyData);
      calculateStreaks(historyData);
      calculateDetailedStats(historyData);
    } catch (error) {
      console.error('Error loading no-fap data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSelectedDateStatus = async () => {
    try {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const entry = await getMasturbationEntry(dateString);
      setSelectedDateStatus(entry?.masturbated || false);
    } catch (error) {
      console.error('Error loading selected date status:', error);
    }
  };

  const calculateDetailedStats = (historyData: any[]) => {
    const totalTracked = historyData.length;
    const relapses = historyData.filter(entry => entry.masturbated).length;
    const cleanDays = historyData.filter(entry => !entry.masturbated).length;

    setTotalDaysTracked(totalTracked);
    setTotalRelapses(relapses);
    setTotalCleanDays(cleanDays);
  };

  const calculateStreaks = (historyData: any[]) => {
    if (historyData.length === 0) {
      setCurrentStreak(0);
      setLongestStreak(0);
      return;
    }

    // Sort by date descending
    const sortedHistory = [...historyData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Calculate current streak (days without masturbation from today backwards)
    let current = 0;
    const today = new Date();
    
    for (let i = 0; i < sortedHistory.length; i++) {
      const entryDate = parseISO(sortedHistory[i].date);
      const daysDiff = differenceInDays(today, entryDate);
      
      if (daysDiff === current && !sortedHistory[i].masturbated) {
        current++;
      } else if (daysDiff === current && sortedHistory[i].masturbated) {
        break;
      }
    }
    
    // Calculate longest streak
    let longest = 0;
    let tempStreak = 0;
    
    // Sort by date ascending for longest streak calculation
    const ascendingHistory = [...historyData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    for (const entry of ascendingHistory) {
      if (!entry.masturbated) {
        tempStreak++;
        longest = Math.max(longest, tempStreak);
      } else {
        tempStreak = 0;
      }
    }
    
    setCurrentStreak(current);
    setLongestStreak(longest);
  };

  const handleTodayUpdate = async (masturbated: boolean) => {
    try {
      await saveMasturbationEntry(getTodayString(), masturbated);
      setTodayStatus(masturbated);
      await loadData(); // Reload to recalculate streaks
      
      toast({
        title: masturbated ? "😞 Relapse Recorded" : "💪 Clean Day Recorded",
        description: masturbated ? "Don't give up, restart your journey!" : "Great job staying strong!",
      });
    } catch (error) {
      console.error('Error updating today status:', error);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDateUpdate = async (masturbated: boolean) => {
    try {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      await saveMasturbationEntry(dateString, masturbated);
      setSelectedDateStatus(masturbated);
      await loadData(); // Reload to recalculate streaks
      
      toast({
        title: "📅 Date Updated",
        description: `Status for ${format(selectedDate, 'MMM dd, yyyy')} has been updated.`,
      });
    } catch (error) {
      console.error('Error updating date status:', error);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Determine overall performance color
  const getPerformanceColor = () => {
    if (totalDaysTracked === 0) return 'text-gray-400';
    return totalCleanDays > totalRelapses ? 'text-green-400' : 'text-red-400';
  };

  const getPerformanceMessage = () => {
    if (totalDaysTracked === 0) return 'Start tracking to see your progress';
    if (totalCleanDays > totalRelapses) {
      return '🎉 You\'re winning! Keep going, Beast!';
    } else {
      return '💪 You need to work harder to make it green! Don\'t give up!';
    }
  };

  const successRate = totalDaysTracked > 0 ? Math.round((totalCleanDays / totalDaysTracked) * 100) : 0;

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
        <div className="text-center text-gray-400">Loading tracker...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Stats Overview */}
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 text-center">Your Journey Stats</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
          <div className="text-center bg-gray-700 rounded-lg p-4">
            <div className="text-3xl sm:text-4xl font-bold text-green-400 mb-2">{currentStreak}</div>
            <div className="text-gray-300 text-sm uppercase tracking-wide">Current Streak</div>
            <div className="text-xs text-gray-400 mt-1">Days Clean</div>
          </div>
          
          <div className="text-center bg-gray-700 rounded-lg p-4">
            <div className="text-3xl sm:text-4xl font-bold text-blue-400 mb-2">{longestStreak}</div>
            <div className="text-gray-300 text-sm uppercase tracking-wide">Longest Streak</div>
            <div className="text-xs text-gray-400 mt-1">Personal Best</div>
          </div>
          
          <div className="text-center bg-gray-700 rounded-lg p-4">
            <div className={`text-3xl sm:text-4xl font-bold mb-2 ${getPerformanceColor()}`}>{totalCleanDays}</div>
            <div className="text-gray-300 text-sm uppercase tracking-wide">Clean Days</div>
            <div className="text-xs text-gray-400 mt-1">Total Success</div>
          </div>
          
          <div className="text-center bg-gray-700 rounded-lg p-4">
            <div className="text-3xl sm:text-4xl font-bold text-red-400 mb-2">{totalRelapses}</div>
            <div className="text-gray-300 text-sm uppercase tracking-wide">Total Relapses</div>
            <div className="text-xs text-gray-400 mt-1">Learning Opportunities</div>
          </div>
        </div>

        {/* Performance Indicator */}
        <div className={`text-center p-4 rounded-lg border-2 ${
          totalCleanDays > totalRelapses 
            ? 'bg-green-900/30 border-green-500' 
            : totalDaysTracked > 0 
              ? 'bg-red-900/30 border-red-500' 
              : 'bg-gray-700 border-gray-600'
        }`}>
          <div className={`text-lg font-bold mb-2 ${getPerformanceColor()}`}>
            Success Rate: {successRate}%
          </div>
          <div className={`text-sm ${getPerformanceColor()}`}>
            {getPerformanceMessage()}
          </div>
          {totalDaysTracked > 0 && (
            <div className="mt-3">
              <div className="w-full bg-gray-600 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    totalCleanDays > totalRelapses 
                      ? 'bg-gradient-to-r from-green-500 to-green-400' 
                      : 'bg-gradient-to-r from-red-500 to-red-400'
                  }`}
                  style={{ width: `${successRate}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {totalCleanDays} clean days out of {totalDaysTracked} tracked days
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Today's Status */}
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Today's Status</h3>
        <div className="text-center">
          <p className="text-gray-300 mb-4">
            How are you doing today? ({format(new Date(), 'MMM dd, yyyy')})
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => handleTodayUpdate(false)}
              className={`px-6 py-3 ${
                todayStatus === false
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              💪 Clean Day
            </Button>
            <Button
              onClick={() => handleTodayUpdate(true)}
              className={`px-6 py-3 ${
                todayStatus === true
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              😞 Relapse
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar and Date Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Calendar View</h3>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border border-gray-600"
            modifiers={{
              clean: (date) => {
                const dateString = format(date, 'yyyy-MM-dd');
                const entry = history.find(h => h.date === dateString);
                return entry && !entry.masturbated;
              },
              relapse: (date) => {
                const dateString = format(date, 'yyyy-MM-dd');
                const entry = history.find(h => h.date === dateString);
                return entry && entry.masturbated;
              }
            }}
            modifiersStyles={{
              clean: { backgroundColor: '#22c55e', color: 'white' },
              relapse: { backgroundColor: '#ef4444', color: 'white' }
            }}
          />
          <div className="mt-4 text-xs text-gray-400">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Clean day</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Relapse</span>
            </div>
          </div>
        </div>

        {/* Selected Date Editor */}
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">
            Edit {format(selectedDate, 'MMM dd, yyyy')}
          </h3>
          <div className="text-center">
            <p className="text-gray-300 mb-4">
              Current status: {selectedDateStatus === null ? 'Not recorded' : selectedDateStatus ? 'Relapse' : 'Clean day'}
            </p>
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => handleDateUpdate(false)}
                className={`px-6 py-3 ${
                  selectedDateStatus === false
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                💪 Mark as Clean Day
              </Button>
              <Button
                onClick={() => handleDateUpdate(true)}
                className={`px-6 py-3 ${
                  selectedDateStatus === true
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                😞 Mark as Relapse
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Motivation Section */}
      <div className={`rounded-xl p-4 sm:p-6 border ${
        totalCleanDays > totalRelapses 
          ? 'bg-gradient-to-r from-green-900 to-green-800 border-green-700' 
          : 'bg-gradient-to-r from-orange-900 to-red-900 border-orange-700'
      }`}>
        <h3 className="text-lg font-semibold text-white mb-3">
          {totalCleanDays > totalRelapses ? '🔥 Beast Mode Activated!' : '💪 Stay Strong, Beast!'}
        </h3>
        <p className="text-orange-100 text-sm sm:text-base">
          {totalCleanDays > totalRelapses 
            ? 'You\'re dominating! Your clean days outnumber your relapses. This is the path of a true Beast. Keep this momentum going!'
            : 'Every day you resist is a victory. Every relapse is a lesson, not a failure. Your journey to self-mastery is what builds the throne of discipline. Keep pushing forward!'
          }
        </p>
      </div>
    </div>
  );
};

export default NoFapTrackerView;
