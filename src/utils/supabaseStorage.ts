
export const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

const API = import.meta.env.VITE_API_URL + '/api';


function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

// --- Daily Tasks ---
export const saveTaskCompletion = async (date: string, taskId: string, completed: boolean): Promise<void> => {
  await fetch(`${API}/daily-tasks`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ date, task_id: taskId, completed })
  });
};

export const getTasksForDate = async (date: string) => {
  const res = await fetch(`${API}/daily-tasks?date=${date}`, {
    headers: getAuthHeaders(),
  });
  return await res.json();
};

export const getCompletedDays = async () => {
  const res = await fetch(`${API}/daily-tasks/completed-days`, {
    headers: getAuthHeaders(),
  });
  return await res.json();
};

export const isDayCompleted = async (date: string) => {
  const days = await getCompletedDays();
  return days.includes(date);
};

// --- Journal ---
export const saveJournalEntry = async (date: string, content: string): Promise<void> => {
  await fetch(`${API}/journal-entries`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ date, content })
  });
};

export const getJournalEntry = async (date: string) => {
  const res = await fetch(`${API}/journal-entries?date=${date}`, {
    headers: getAuthHeaders(),
  });
  return await res.json();
};

export const getAllJournalEntries = async () => {
  const res = await fetch(`${API}/journal-entries/all`, {
    headers: getAuthHeaders(),
  });
  const entries = await res.json();
  // Convert to { [date]: content }
  const map: { [date: string]: string } = {};
  entries.forEach((entry: any) => {
    map[entry.date] = entry.content;
  });
  return map;
};

// --- Daily Goals ---
export const saveDailyGoal = async (date: string, goalId: string, completed: boolean): Promise<void> => {
  await fetch(`${API}/daily-goals`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ date, goal_id: goalId, completed })
  });
};

export const getDailyGoalsForDate = async (date: string) => {
  const res = await fetch(`${API}/daily-goals?date=${date}`, {
    headers: getAuthHeaders(),
  });
  return await res.json();
};

export const getStreakData = async () => {
  const res = await fetch(`${API}/daily-goals/streak-days`, {
    headers: getAuthHeaders(),
  });
  return await res.json();
};

// --- NoFap (Masturbation) Tracking ---
export const saveMasturbationEntry = async (date: string, masturbated: boolean): Promise<void> => {
  await fetch(`${API}/nofap-tracking`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ date, masturbated })
  });
};

export const getMasturbationEntry = async (date: string) => {
  const res = await fetch(`${API}/nofap-tracking?date=${date}`, {
    headers: getAuthHeaders(),
  });
  return await res.json();
};

export const getMasturbationHistory = async () => {
  const res = await fetch(`${API}/nofap-tracking/history`, {
    headers: getAuthHeaders(),
  });
  return await res.json();
};
