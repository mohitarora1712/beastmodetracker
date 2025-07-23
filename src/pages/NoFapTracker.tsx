
import { useState } from 'react';
import Navigation from '@/components/Navigation';
import NoFapTrackerView from '@/components/NoFapTrackerView';
import { useAuth } from '@/hooks/useAuth';
import Auth from '@/components/Auth';

const NoFapTracker = () => {
  const { user, loading } = useAuth();

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
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-3 sm:mb-4">
            NO-FAP TRACKER
          </h1>
          <p className="text-base sm:text-lg text-gray-300 px-4">
            Track your journey to freedom and self-control.
          </p>
        </div>

        {/* No-Fap Tracker View */}
        <NoFapTrackerView />
      </div>
    </div>
  );
};

export default NoFapTracker;
