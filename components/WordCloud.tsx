import React, { useMemo } from 'react';
import { scaleLinear } from 'd3';
import { WordFrequency } from '../types';

interface WordCloudProps {
  words: WordFrequency[];
}

export const WordCloud: React.FC<WordCloudProps> = ({ words }) => {
  const sortedWords = useMemo(() => {
    return [...words].sort((a, b) => b.value - a.value).slice(0, 30); // Top 30 words
  }, [words]);

  // Create a linear scale for font sizes
  const fontScale = useMemo(() => {
    if (sortedWords.length === 0) return () => 14;
    const maxVal = Math.max(...sortedWords.map(w => w.value));
    const minVal = Math.min(...sortedWords.map(w => w.value));
    return scaleLinear().domain([minVal, maxVal]).range([14, 42]);
  }, [sortedWords]);

  const getColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100';
      case 'negative': return 'text-rose-600 bg-rose-50 hover:bg-rose-100';
      default: return 'text-slate-600 bg-slate-100 hover:bg-slate-200';
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full">
      <h3 className="text-lg font-bold text-slate-900 mb-6">Key Topics</h3>
      <div className="flex flex-wrap gap-3 items-center justify-center min-h-[250px] content-center">
        {sortedWords.map((word, idx) => (
          <span
            key={idx}
            className={`px-3 py-1 rounded-full transition-all duration-300 cursor-default select-none ${getColor(word.sentiment)}`}
            style={{ 
              fontSize: `${fontScale(word.value)}px`,
              opacity: 0.9
            }}
            title={`${word.value} occurrences`}
          >
            {word.text}
          </span>
        ))}
      </div>
    </div>
  );
};