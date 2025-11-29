import React from 'react';
import { Option } from '../types';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

interface OptionGridProps {
  options: Option[];
  onSelect: (option: Option) => void;
  selectedOptionId: string | null;
  hasSubmitted: boolean;
}

export const OptionGrid: React.FC<OptionGridProps> = ({ 
  options, 
  onSelect, 
  selectedOptionId,
  hasSubmitted 
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 w-full">
      {options.map((option) => {
        const isSelected = selectedOptionId === option.id;
        
        // Determine style based on state
        let containerClass = "relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 text-left flex items-start gap-4 group ";
        
        if (hasSubmitted) {
            if (option.isCorrect) {
                containerClass += "bg-emerald-50 border-emerald-500 shadow-md ring-1 ring-emerald-500";
            } else if (isSelected && !option.isCorrect) {
                containerClass += "bg-red-50 border-red-500 opacity-80";
            } else {
                containerClass += "bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed";
            }
        } else {
            if (isSelected) {
                containerClass += "bg-indigo-50 border-indigo-500 shadow-sm";
            } else {
                containerClass += "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm";
            }
        }

        return (
          <button
            key={option.id}
            onClick={() => !hasSubmitted && onSelect(option)}
            disabled={hasSubmitted}
            className={containerClass}
          >
            <div className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
              ${hasSubmitted && option.isCorrect ? 'border-emerald-500 bg-emerald-500 text-white' : ''}
              ${hasSubmitted && isSelected && !option.isCorrect ? 'border-red-500 bg-red-500 text-white' : ''}
              ${!hasSubmitted && isSelected ? 'border-indigo-500' : 'border-slate-300 group-hover:border-indigo-400'}
            `}>
               {hasSubmitted && option.isCorrect && <CheckCircle2 size={14} />}
               {hasSubmitted && isSelected && !option.isCorrect && <XCircle size={14} />}
               {!hasSubmitted && isSelected && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
            </div>

            <div className="flex-1">
              <p className={`text-lg font-medium ${hasSubmitted && option.isCorrect ? 'text-emerald-900' : 'text-slate-700'}`}>
                {option.text}
              </p>
              
              {hasSubmitted && (isSelected || option.isCorrect) && (
                <div className={`mt-2 text-sm p-2 rounded ${option.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                   {option.isCorrect ? "Match!" : "Not quite."} {option.explanation}
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
