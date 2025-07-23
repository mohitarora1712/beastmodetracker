
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import Journal from '@/pages/Journal';
import TaskHistory from '@/pages/TaskHistory';
import NoFapTracker from '@/pages/NoFapTracker';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/task-history" element={<TaskHistory />} />
          <Route path="/nofap-tracker" element={<NoFapTracker />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
