
import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { getDailyGoalsForDate, getStreakData } from '@/utils/supabaseStorage';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

const DAILY_BEAST_GOALS = [
  {
    id: 'no-fap',
    title: 'No Fap',
    emoji: '🚫'
  },
  {
    id: 'hair-care',
    title: 'Hair Care',
    emoji: '💇‍♂️'
  },
  {
    id: 'skin-care',
    title: 'Skin Care',
    emoji: '✨'
  },
  {
    id: 'gym',
    title: 'Gym',
    emoji: '💪'
  },
  {
    id: 'no-chasing-girls',
    title: 'No Chasing Girls',
    emoji: '🎯'
  },
  {
    id: 'career-task',
    title: '3 Hours Career Task',
    emoji: '🔥'
  }
];

const TaskHistoryView = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [goalsHistory, setGoalsHistory] = useState<any[]>([]);
  const [selectedDateGoals, setSelectedDateGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month');

  useEffect(() => {
    loadGoalsHistory();
  }, [timeRange]);

  useEffect(() => {
    loadGoalsForSelectedDate();
  }, [selectedDate]);

  const loadGoalsHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('daily_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      const today = new Date();
      if (timeRange === 'week') {
        const startDate = format(subDays(today, 7), 'yyyy-MM-dd');
        query = query.gte('date', startDate);
      } else if (timeRange === 'month') {
        const startDate = format(startOfMonth(today), 'yyyy-MM-dd');
        query = query.gte('date', startDate);
      }

      const { data } = await query;
      setGoalsHistory(data || []);
    } catch (error) {
      console.error('Error loading goals history:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGoalsForSelectedDate = async () => {
    try {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const goals = await getDailyGoalsForDate(dateString);
      setSelectedDateGoals(goals);
    } catch (error) {
      console.error('Error loading goals for date:', error);
    }
  };

  const getGoalCompletionForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const goalsForDate = goalsHistory.filter(goal => goal.date === dateString && goal.completed);
    return goalsForDate.length;
  };

  const getGoalAnalytics = () => {
    const analytics = DAILY_BEAST_GOALS.map(goal => {
      const completedDays = goalsHistory.filter(h => h.goal_id === goal.id && h.completed).length;
      const totalDays = [...new Set(goalsHistory.map(h => h.date))].length;
      return {
        ...goal,
        completedDays,
        totalDays,
        percentage: totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0
      };
    });
    return analytics;
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
        <div className="text-center text-gray-400">Loading history...</div>
      </div>
    );
  }

  const analytics = getGoalAnalytics();

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Time Range</h3>
        <div className="flex flex-wrap gap-2">
          {(['week', 'month', 'all'] as const).map((range) => (
            <Button
              key={range}
              onClick={() => setTimeRange(range)}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              className={timeRange === range ? 'bg-orange-600 hover:bg-orange-700' : ''}
            >
              {range === 'week' ? 'Last 7 Days' : range === 'month' ? 'This Month' : 'All Time'}
            </Button>
          ))}
        </div>
      </div>

      {/* Daily Beast Goals Analytics */}
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Daily Beast Goals Performance</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {analytics.map((goal) => (
            <div key={goal.id} className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">{goal.emoji}</span>
                <span className="font-medium text-white">{goal.title}</span>
              </div>
              <div className="text-sm text-gray-300 mb-2">
                {goal.completedDays} / {goal.totalDays} days completed
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${goal.percentage}%` }}
                ></div>
              </div>
              <div className="text-right text-sm text-gray-400 mt-1">
                {goal.percentage}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar and Selected Date Goals */}
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
              completed: (date) => getGoalCompletionForDate(date) >= 3,
              partial: (date) => {
                const completed = getGoalCompletionForDate(date);
                return completed > 0 && completed < 3;
              }
            }}
            modifiersStyles={{
              completed: { backgroundColor: '#22c55e', color: 'white' },
              partial: { backgroundColor: '#f59e0b', color: 'white' }
            }}
          />
          <div className="mt-4 text-xs text-gray-400">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Beast mode (3+ goals completed)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Partial completion</span>
            </div>
          </div>
        </div>

        {/* Selected Date Goals */}
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">
            Daily Beast Goals for {format(selectedDate, 'MMM dd, yyyy')}
          </h3>
          <div className="space-y-3">
            {DAILY_BEAST_GOALS.map((goal) => {
              const isCompleted = selectedDateGoals.some(g => g.goal_id === goal.id && g.completed);
              return (
                <div
                  key={goal.id}
                  className={`flex items-center p-3 rounded-lg border ${
                    isCompleted
                      ? 'bg-green-900 border-green-500'
                      : 'bg-gray-700 border-gray-600'
                  }`}
                >
                  <span className="text-xl mr-3">{goal.emoji}</span>
                  <span className="font-medium text-white flex-1">{goal.title}</span>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    isCompleted ? 'bg-green-500 border-green-500' : 'border-gray-500'
                  }`}>
                    {isCompleted && <span className="text-white text-xs">✓</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskHistoryView;
