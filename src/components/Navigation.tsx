
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const Navigation = () => {
  const location = useLocation();
  const { signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Navigation Links */}
        <div className="flex flex-wrap gap-2 sm:gap-4">
          <Link 
            to="/" 
            className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
              isActive('/') 
                ? 'bg-orange-600 text-white' 
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            🏠 Home
          </Link>
          <Link 
            to="/journal" 
            className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
              isActive('/journal') 
                ? 'bg-orange-600 text-white' 
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            📝 Journal
          </Link>
          <Link 
            to="/task-history" 
            className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
              isActive('/task-history') 
                ? 'bg-orange-600 text-white' 
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            📊 History
          </Link>
          <Link 
            to="/nofap-tracker" 
            className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
              isActive('/nofap-tracker') 
                ? 'bg-orange-600 text-white' 
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            🚫 No-Fap
          </Link>
        </div>

        {/* Sign Out Button */}
        <Button
          onClick={signOut}
          variant="outline"
          size="sm"
          className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 w-full sm:w-auto"
        >
          Sign Out
        </Button>
      </div>
    </nav>
  );
};

export default Navigation;
