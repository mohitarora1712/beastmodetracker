
export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
}

export const calculateStreaks = (completedDays: string[]): StreakStats => {
  const totalDays = completedDays.length;
  
  if (totalDays === 0) {
    return { currentStreak: 0, longestStreak: 0, totalDays: 0 };
  }

  // Sort dates to ensure chronological order
  const sortedDays = [...completedDays].sort();
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;
  
  // Calculate longest streak
  for (let i = 1; i < sortedDays.length; i++) {
    const prevDate = new Date(sortedDays[i - 1]);
    const currDate = new Date(sortedDays[i]);
    const dayDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (dayDiff === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);
  
  // Calculate current streak (from most recent completed day)
  if (sortedDays.length > 0) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    const todayString = today.toISOString().split('T')[0];
    const yesterdayString = yesterday.toISOString().split('T')[0];
    const mostRecentDay = sortedDays[sortedDays.length - 1];
    
    if (mostRecentDay === todayString || mostRecentDay === yesterdayString) {
      // Count backwards from most recent day
      currentStreak = 1;
      for (let i = sortedDays.length - 2; i >= 0; i--) {
        const currDate = new Date(sortedDays[i + 1]);
        const prevDate = new Date(sortedDays[i]);
        const dayDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (dayDiff === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
  }
  
  return { currentStreak, longestStreak, totalDays };
};
