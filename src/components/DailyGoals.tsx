
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { getTodayString, saveDailyGoal, getDailyGoalsForDate } from '@/utils/supabaseStorage';

const DAILY_GOALS = [
  { id: 'no-fap', title: 'No Fap', emoji: '🚫', description: 'Stay strong, stay focused' },
  { id: 'hair-care', title: 'Hair Care', emoji: '💇‍♂️', description: 'Maintain your crown' },
  { id: 'skin-care', title: 'Skin Care', emoji: '✨', description: 'Glow from within' },
  { id: 'gym', title: 'Gym', emoji: '💪', description: 'Build your temple' },
  { id: 'no-chasing-girls', title: 'No Chasing Girls', emoji: '🎯', description: 'Focus on your mission' },
  { id: 'career-task', title: '3 Hours Career Task', emoji: '🔥', description: 'Invest in your future' },
];

const DailyGoals = () => {
  const [completedGoals, setCompletedGoals] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const today = getTodayString();

  useEffect(() => {
    loadGoals();
    // eslint-disable-next-line
  }, []);

  const loadGoals = async () => {
    setLoading(true);
    try {
      const goals = await getDailyGoalsForDate(today);
      const completed = (goals || [])
        .filter((goal: any) => goal.completed)
        .map((goal: any) => goal.goal_id);
      setCompletedGoals(completed);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoalToggle = async (goalId: string) => {
    const isCurrentlyCompleted = completedGoals.includes(goalId);
    const newCompleted = !isCurrentlyCompleted;
    try {
      await saveDailyGoal(today, goalId, newCompleted);
      if (newCompleted) {
        setCompletedGoals([...completedGoals, goalId]);
      } else {
        setCompletedGoals(completedGoals.filter(id => id !== goalId));
      }
      // Optionally reload to ensure streak logic is up to date
      await loadGoals();
    } catch (error) {
      console.error('Error toggling goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to update goal. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-700">
        <div className="text-center text-gray-400">Loading daily goals...</div>
      </div>
    );
  }

  const completedCount = completedGoals.length;
  const isStreakDay = completedCount >= 3;

  return (
    <div className="bg-gray-800 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-700">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Daily Beast Goals</h2>
        <div className="text-center sm:text-right">
          <div className="text-orange-400 font-semibold text-sm sm:text-base">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
          <div className={`text-sm ${isStreakDay ? 'text-green-400' : 'text-gray-400'}`}>{completedCount}/6 completed {isStreakDay && '🔥'}</div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {DAILY_GOALS.map((goal) => (
          <div
            key={goal.id}
            className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
              completedGoals.includes(goal.id)
                ? 'bg-green-900 border-green-500 shadow-green-500/20 shadow-lg'
                : 'bg-gray-700 border-gray-600 hover:border-orange-500 hover:bg-gray-650'
            }`}
            onClick={() => handleGoalToggle(goal.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl">{goal.emoji}</div>
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                completedGoals.includes(goal.id)
                  ? 'bg-green-500 border-green-500'
                  : 'border-gray-500'
              }`}>
                {completedGoals.includes(goal.id) && (
                  <span className="text-white text-xs">✓</span>
                )}
              </div>
            </div>
            <h3 className="font-semibold text-white text-sm mb-1">{goal.title}</h3>
            <p className="text-gray-300 text-xs">{goal.description}</p>
          </div>
        ))}
      </div>
      {isStreakDay && (
        <div className="mt-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-3 text-center">
          <div className="text-white font-bold">🔥 Streak Day Achieved! 🔥</div>
          <div className="text-orange-100 text-sm">3+ goals completed - your streak continues!</div>
        </div>
      )}
    </div>
  );
};

export default DailyGoals;
