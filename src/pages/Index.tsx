
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import DailyGoals from '@/components/DailyGoals';
import TaskManager from '@/components/TaskManager';
import StreakDisplay from '@/components/StreakDisplay';
import MotivationalQuoteSlider from '@/components/MotivationalQuoteSlider';
import { useAuth } from '@/hooks/useAuth';
import Auth from '@/components/Auth';

const Index = () => {
  const { user, loading } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUpdate = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-4xl">
        <Navigation />
        
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-3 sm:mb-4">
            BEAST MODE TRACKER
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 font-medium px-4">
            Welcome, Beast. Your discipline builds the throne.
          </p>
        </div>

        {/* Motivational Quote Slider */}
        <MotivationalQuoteSlider />

        {/* Streak Display */}
        <StreakDisplay key={`streak-${refreshKey}`} />

        {/* Daily Goals */}
        <DailyGoals key={`goals-${refreshKey}`} />

        {/* Custom Task Manager */}
        <div className="mb-6 sm:mb-8">
          <TaskManager />
        </div>

        {/* Quick Journal Link */}
        <div className="mt-6 sm:mt-8 text-center">
          <Link 
            to="/journal" 
            className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold transition-colors duration-200 text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            📝 Open Journal
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
