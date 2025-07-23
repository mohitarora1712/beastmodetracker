
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { saveTaskCompletion, getTasksForDate, getTodayString, isDayCompleted } from '@/utils/supabaseStorage';

const TASKS = [
  {
    id: 'mind-rewire',
    title: 'Mind Rewire',
    description: 'No Porn, Journaling, Cold Shower',
    emoji: '🧠'
  },
  {
    id: 'body-movement',
    title: 'Body Movement', 
    description: 'Workout, Walk, Diet',
    emoji: '💪'
  },
  {
    id: 'dopamine-detox',
    title: 'Dopamine Detox',
    description: 'No Reels/Scrolling, Focus Time',
    emoji: '🎯'
  },
  {
    id: 'purpose-work',
    title: 'Purpose Work',
    description: '1 Hour of Skill Building',
    emoji: '🔥'
  }
];

const TaskTracker = () => {
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [dayCompleted, setDayCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const today = getTodayString();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const tasks = await getTasksForDate(today);
      const completed = tasks.filter(task => task.completed).map(task => task.task_id);
      setCompletedTasks(completed);
      
      const isCompleted = await isDayCompleted(today);
      setDayCompleted(isCompleted);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskToggle = async (taskId: string) => {
    if (dayCompleted) return;

    const isCurrentlyCompleted = completedTasks.includes(taskId);
    const newCompleted = !isCurrentlyCompleted;

    try {
      await saveTaskCompletion(today, taskId, newCompleted);
      
      if (newCompleted) {
        setCompletedTasks([...completedTasks, taskId]);
      } else {
        setCompletedTasks(completedTasks.filter(id => id !== taskId));
      }
      
      // Reload to check if day is complete
      await loadTasks();
    } catch (error) {
      console.error('Error toggling task:', error);
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const markDayComplete = async () => {
    if (completedTasks.length === TASKS.length) {
      await loadTasks();
      toast({
        title: "🔥 Beast Mode Activated!",
        description: "Another day conquered. Your throne grows stronger.",
      });
    }
  };

  const allTasksCompleted = completedTasks.length === TASKS.length;

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-700">
        <div className="text-center text-gray-400">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-700">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Today's Mission</h2>
        <div className="text-orange-400 font-semibold text-sm sm:text-base text-center sm:text-right">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          })}
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
        {TASKS.map((task) => (
          <div
            key={task.id}
            className={`flex items-center p-3 sm:p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
              completedTasks.includes(task.id)
                ? 'bg-green-900 border-green-500 shadow-green-500/20 shadow-lg'
                : dayCompleted
                ? 'bg-gray-700 border-gray-600 cursor-not-allowed opacity-60'
                : 'bg-gray-700 border-gray-600 hover:border-orange-500 hover:bg-gray-650'
            }`}
            onClick={() => handleTaskToggle(task.id)}
          >
            <div className="flex items-center flex-1 min-w-0 gap-3">
              <div className="text-xl sm:text-2xl flex-shrink-0">{task.emoji}</div>
              <div className="min-w-0">
                <h3 className="font-semibold text-white text-sm sm:text-base">{task.title}</h3>
                <p className="text-gray-300 text-xs sm:text-sm break-words">{task.description}</p>
              </div>
            </div>
            <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ${
              completedTasks.includes(task.id)
                ? 'bg-green-500 border-green-500'
                : 'border-gray-500'
            }`}>
              {completedTasks.includes(task.id) && (
                <span className="text-white text-xs sm:text-sm">✓</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        {dayCompleted ? (
          <div className="bg-green-900 border border-green-500 rounded-lg p-3 sm:p-4">
            <div className="text-green-400 text-lg sm:text-xl font-bold mb-2">🏆 Day Complete!</div>
            <p className="text-green-300 text-sm sm:text-base">You've conquered today's challenges.</p>
          </div>
        ) : (
          <Button
            onClick={markDayComplete}
            disabled={!allTasksCompleted}
            className={`px-4 sm:px-8 py-2 sm:py-3 text-sm sm:text-lg font-bold transition-all duration-200 w-full sm:w-auto ${
              allTasksCompleted
                ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-500/30'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {allTasksCompleted ? '🔥 Mark Day Complete' : `Complete ${TASKS.length - completedTasks.length} More Tasks`}
          </Button>
        )}
      </div>
    </div>
  );
};

export default TaskTracker;
