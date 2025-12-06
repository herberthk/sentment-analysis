import React, { useState } from 'react';
import { LayoutDashboard, LogOut } from 'lucide-react';
import { InputForm } from './components/InputForm';
import { SentimentChart } from './components/SentimentChart';
import { WordCloud } from './components/WordCloud';
import { SummaryCard } from './components/SummaryCard';
import { ChatWidget } from './components/ChatWidget';
import { analyzeReviews } from './services/geminiService';
import { AnalysisResult } from './types';

export default function App() {
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'success' | 'error'>('idle');
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleAnalyze = async (text: string) => {
    setStatus('analyzing');
    setErrorMsg('');
    try {
      const result = await analyzeReviews(text);
      setData(result);
      setStatus('success');
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMsg(err.message || "Failed to analyze data. Please check your API Key and try again.");
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setData(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-indigo-500">
              Sentilens
            </h1>
          </div>
          {status === 'success' && (
            <button 
              onClick={handleReset}
              className="text-sm font-medium text-slate-500 hover:text-slate-800 flex items-center space-x-1"
            >
              <LogOut className="w-4 h-4" />
              <span>New Analysis</span>
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {status === 'idle' || status === 'analyzing' || status === 'error' ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in duration-500">
            <div className="text-center mb-10 max-w-2xl">
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl mb-4">
                Unlock Customer <span className="text-indigo-600">Insights</span>
              </h2>
              <p className="text-lg text-slate-600">
                Transform raw feedback into actionable strategy using advanced AI sentiment analysis.
              </p>
            </div>
            <InputForm onAnalyze={handleAnalyze} isAnalyzing={status === 'analyzing'} />
            
            {status === 'error' && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg max-w-lg text-center animate-in slide-in-from-top-2">
                <p className="font-semibold">Analysis Failed</p>
                <p className="text-sm">{errorMsg}</p>
              </div>
            )}
          </div>
        ) : (
          data && (
            <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700">
              {/* Top Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-indigo-600 rounded-xl p-6 text-white shadow-lg shadow-indigo-200">
                  <p className="text-indigo-100 font-medium mb-1">Overall Sentiment</p>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-5xl font-bold">{data.overallSentiment}</span>
                    <span className="text-xl opacity-80">/100</span>
                  </div>
                  <div className="mt-4 h-2 bg-indigo-800/50 rounded-full overflow-hidden">
                    <div className="h-full bg-white/90 rounded-full" style={{ width: `${data.overallSentiment}%` }}></div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center">
                   <p className="text-slate-500 font-medium mb-1">Total Reviews Analyzed</p>
                   <p className="text-4xl font-bold text-slate-800">{data.totalReviews}</p>
                </div>
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center">
                   <p className="text-slate-500 font-medium mb-1">Data Range</p>
                   <p className="text-lg font-bold text-slate-800">
                     {new Date(data.reviews[0]?.date).toLocaleDateString()} - {new Date(data.reviews[data.reviews.length - 1]?.date).toLocaleDateString()}
                   </p>
                   <p className="text-xs text-slate-400 mt-1">Estimated based on input</p>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <SentimentChart data={data.reviews} />
                </div>
                <div className="lg:col-span-1">
                   <SummaryCard items={data.summary} />
                </div>
              </div>

              <div className="grid grid-cols-1">
                <WordCloud words={data.wordCloud} />
              </div>
            </div>
          )
        )}
      </main>

      <ChatWidget contextData={data} />
    </div>
  );
}