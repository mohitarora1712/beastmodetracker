
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { saveJournalEntry, getJournalEntry, getCompletedDays, getAllJournalEntries, getTodayString } from '@/utils/supabaseStorage';

interface JournalEntryProps {
  onUpdate: () => void;
}

const JournalEntry = ({ onUpdate }: JournalEntryProps) => {
  const [entry, setEntry] = useState('');
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAvailableDates();
  }, []);

  useEffect(() => {
    loadEntryForDate();
  }, [selectedDate]);

  const loadAvailableDates = async () => {
    try {
      const completedDays = await getCompletedDays();
      const journalEntries = await getAllJournalEntries();
      const journalDates = Object.keys(journalEntries);
      
      const allDates = Array.from(new Set([...completedDays, ...journalDates])).sort().reverse();
      
      // Always include today
      if (!allDates.includes(getTodayString())) {
        allDates.unshift(getTodayString());
      }
      
      setAvailableDates(allDates);
    } catch (error) {
      console.error('Error loading available dates:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEntryForDate = async () => {
    try {
      const journalEntry = await getJournalEntry(selectedDate);
      setEntry(journalEntry?.content || '');
    } catch (error) {
      console.error('Error loading journal entry:', error);
      setEntry('');
    }
  };

  const handleSave = async () => {
    try {
      await saveJournalEntry(selectedDate, entry);
      onUpdate();
      toast({
        title: "📝 Journal Saved",
        description: "Your reflection has been saved.",
      });
    } catch (error) {
      console.error('Error saving journal entry:', error);
      toast({
        title: "Error",
        description: "Failed to save journal entry. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
        <div className="text-center text-gray-400">Loading journal...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
      {/* Date Selector */}
      <div className="mb-4 sm:mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Select Date
        </label>
        <select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full px-3 sm:px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm sm:text-base focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          {availableDates.map((date) => (
            <option key={date} value={date}>
              {formatDate(date)} {date === getTodayString() ? '(Today)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Journal Textarea */}
      <div className="mb-4 sm:mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Daily Reflection for {formatDate(selectedDate)}
        </label>
        <textarea
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          placeholder="How did today go? What did you learn? What will you improve tomorrow?"
          className="w-full h-48 sm:h-64 px-3 sm:px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-sm sm:text-base focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Save Button */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="text-xs sm:text-sm text-gray-400 order-2 sm:order-1 text-center sm:text-left">
          {entry.length} characters
        </div>
        <Button
          onClick={handleSave}
          className="px-4 sm:px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold transition-colors duration-200 w-full sm:w-auto order-1 sm:order-2"
        >
          💾 Save Entry
        </Button>
      </div>
    </div>
  );
};

export default JournalEntry;
