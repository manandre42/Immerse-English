import React from 'react';
import { Volume2, Info, Image as ImageIcon } from 'lucide-react';
import { LearningCard } from '../types';

interface WordHeaderProps {
  card: LearningCard;
}

export const WordHeader: React.FC<WordHeaderProps> = ({ card }) => {
  const [showDefinition, setShowDefinition] = React.useState(false);

  const speakWord = (e: React.MouseEvent) => {
    e.stopPropagation();
    const utterance = new SpeechSynthesisUtterance(card.word);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6 flex flex-col items-center text-center relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
      
      <button 
        onClick={() => setShowDefinition(!showDefinition)}
        className="absolute top-3 right-3 text-slate-300 hover:text-indigo-500 transition-colors"
        title="Toggle Definition Hint"
      >
        <Info size={20} />
      </button>

      <div className="mb-4">
        <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold tracking-wider uppercase mb-4">
          Target Word
        </span>
      </div>

      {/* Image Association Section */}
      <div className="relative w-40 h-40 mb-6 rounded-xl overflow-hidden bg-slate-50 border-2 border-slate-100 shadow-inner flex items-center justify-center">
        {card.imageUrl ? (
          <img 
            src={card.imageUrl} 
            alt={card.word} 
            className="w-full h-full object-cover animate-in fade-in duration-700"
          />
        ) : (
          <div className="text-slate-300 flex flex-col items-center gap-2">
            <ImageIcon size={32} />
            <span className="text-xs">No image</span>
          </div>
        )}
      </div>

      <h1 className="text-5xl font-bold text-slate-800 mb-2 tracking-tight capitalize">{card.word}</h1>
      
      {card.phonetic && (
        <p className="text-slate-400 font-mono text-sm mb-4">{card.phonetic}</p>
      )}

      <button 
        onClick={speakWord}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-full transition-all active:scale-95"
      >
        <Volume2 size={18} />
        <span className="font-medium">Listen</span>
      </button>

      <div className={`mt-6 transition-all duration-300 overflow-hidden ${showDefinition ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}>
        <p className="text-slate-600 italic border-l-4 border-indigo-200 pl-4 text-left">
          "{card.definition}"
        </p>
      </div>
    </div>
  );
};