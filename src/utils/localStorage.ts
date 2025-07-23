
export interface BeastModeData {
  completedDays: string[];
  journalEntries: { [date: string]: string };
  dailyTasks: { 
    [date: string]: {
      completedTasks: string[];
      dayCompleted: boolean;
    }
  };
}

export const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const getStorageData = (): BeastModeData => {
  const stored = localStorage.getItem('beastModeData');
  if (stored) {
    return JSON.parse(stored);
  }
  
  return {
    completedDays: [],
    journalEntries: {},
    dailyTasks: {}
  };
};

export const saveTaskCompletion = (date: string, completedTasks: string[]): void => {
  const data = getStorageData();
  
  // Add to completed days if all tasks done
  if (completedTasks.length === 4 && !data.completedDays.includes(date)) {
    data.completedDays.push(date);
    data.completedDays.sort();
  }
  
  // Update daily tasks
  data.dailyTasks[date] = {
    completedTasks,
    dayCompleted: true
  };
  
  localStorage.setItem('beastModeData', JSON.stringify(data));
};

export const saveJournalEntry = (date: string, entry: string): void => {
  const data = getStorageData();
  data.journalEntries[date] = entry;
  localStorage.setItem('beastModeData', JSON.stringify(data));
};
