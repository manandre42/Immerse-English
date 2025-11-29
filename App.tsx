import React, { useState, useEffect, useCallback } from 'react';
import { generateNextCard } from './services/geminiService';
import { LearningCard, Option, GameState } from './types';
import { WordHeader } from './components/WordHeader';
import { OptionGrid } from './components/OptionGrid';
import { LoadingSpinner } from './components/LoadingSpinner';
import { BrainCircuit, Trophy, ArrowRight, Trash2 } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.LOADING);
  const [currentCard, setCurrentCard] = useState<LearningCard | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  
  // Persistent Score State
  const [score, setScore] = useState(() => {
    try {
      const saved = localStorage.getItem('immerse_score');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Persistent Streak State
  const [streak, setStreak] = useState(() => {
    try {
      const saved = localStorage.getItem('immerse_streak');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [history, setHistory] = useState<string[]>([]);

  // Persist score changes
  useEffect(() => {
    localStorage.setItem('immerse_score', score.toString());
  }, [score]);

  // Persist streak changes
  useEffect(() => {
    localStorage.setItem('immerse_streak', streak.toString());
  }, [streak]);

  const fetchCard = useCallback(async () => {
    setGameState(GameState.LOADING);
    setSelectedOptionId(null);
    
    const card = await generateNextCard(history.slice(-10)); 
    
    setCurrentCard(card);
    setHistory(prev => [...prev, card.word]);
    setGameState(GameState.PLAYING);
  }, [history]);

  useEffect(() => {
    fetchCard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const handleOptionSelect = (option: Option) => {
    if (gameState !== GameState.PLAYING) return;
    
    setSelectedOptionId(option.id);
    
    if (option.isCorrect) {
        setScore(s => s + 10);
        setStreak(s => s + 1);
        setGameState(GameState.SUCCESS);
    } else {
        setStreak(0);
        setGameState(GameState.ERROR);
    }
  };

  const handleNext = () => {
    fetchCard();
  };

  const resetProgress = () => {
      if(window.confirm("Reset score and streak?")) {
          setScore(0);
          setStreak(0);
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600">
            <BrainCircuit className="w-6 h-6" />
            <span className="font-bold text-xl tracking-tight hidden sm:inline">Immerse</span>
          </div>
          
          <div className="flex items-center gap-4 text-sm font-medium">
            <div className="flex items-center gap-1.5 text-orange-500 bg-orange-50 px-3 py-1 rounded-full">
              <Trophy size={16} />
              <span>{streak} Streak</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <span>Score: {score}</span>
              <button 
                onClick={resetProgress}
                className="text-slate-300 hover:text-red-400 p-1"
                title="Reset Score"
              >
                  <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-start p-6 max-w-md mx-auto w-full">
        
        <div className="w-full text-center mb-6">
            <p className="text-slate-500 text-sm uppercase tracking-widest font-semibold">
                Match the situation
            </p>
        </div>

        {gameState === GameState.LOADING ? (
          <LoadingSpinner />
        ) : currentCard ? (
          <>
            <WordHeader card={currentCard} />
            
            <OptionGrid 
              options={currentCard.options}
              onSelect={handleOptionSelect}
              selectedOptionId={selectedOptionId}
              hasSubmitted={gameState === GameState.SUCCESS || gameState === GameState.ERROR}
            />
          </>
        ) : (
          <div className="text-center p-8">
            <p>Something went wrong loading the card.</p>
            <button onClick={fetchCard} className="mt-4 text-indigo-600 underline">Try Again</button>
          </div>
        )}

      </main>

      {/* Footer / Sticky Action */}
      {(gameState === GameState.SUCCESS || gameState === GameState.ERROR) && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom-10 duration-200 z-20">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <div className="flex flex-col">
                <span className={`text-lg font-bold ${gameState === GameState.SUCCESS ? 'text-emerald-600' : 'text-slate-600'}`}>
                    {gameState === GameState.SUCCESS ? 'Excellent!' : 'Check the answer above.'}
                </span>
                <span className="text-sm text-slate-400">Continue learning</span>
            </div>
            
            <button
              onClick={handleNext}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all transform active:scale-95 shadow-lg
                ${gameState === GameState.SUCCESS ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200' : 'bg-slate-800 hover:bg-slate-900 shadow-slate-300'}
              `}
            >
              <span>Next Word</span>
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;