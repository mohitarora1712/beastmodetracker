
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const QUOTES = [
  "Action cures doubt—move first, think later.",
  "Discipline is destiny; comfort is decay.",
  "Today's reps write tomorrow's reputation.",
  "No porn, no pity—power stays in my hands.",
  "If it's not tracked, it never happened.",
  "I attract by building value, not by begging for it.",
  "Sweat and study before sunrise; earn the right to relax.",
  "Rejection is just resistance training for confidence.",
  "Body strong, mind calm, mission locked.",
  "I create my odds by moving—luck follows my footsteps."
];

const MotivationalQuoteSlider = () => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % QUOTES.length);
    }, 5000); // Change quote every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const nextQuote = () => {
    setCurrentQuoteIndex((prev) => (prev + 1) % QUOTES.length);
  };

  const prevQuote = () => {
    setCurrentQuoteIndex((prev) => (prev - 1 + QUOTES.length) % QUOTES.length);
  };

  return (
    <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-6 mb-6 sm:mb-8 border border-orange-500 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative z-10 flex items-center justify-between">
        <Button
          onClick={prevQuote}
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20 flex-shrink-0"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex-1 mx-4 text-center">
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white leading-relaxed animate-fade-in">
            "{QUOTES[currentQuoteIndex]}"
          </p>
        </div>
        
        <Button
          onClick={nextQuote}
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20 flex-shrink-0"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="flex justify-center mt-4 space-x-2">
        {QUOTES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentQuoteIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              index === currentQuoteIndex ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default MotivationalQuoteSlider;
