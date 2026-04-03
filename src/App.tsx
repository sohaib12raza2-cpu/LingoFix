import { useState, useEffect } from 'react';
import { processText, ProcessMode } from './lib/gemini';
import { Copy, Check, Loader2, History, Trash2, ArrowRightLeft, SpellCheck, Sparkles, X } from 'lucide-react';
import { Toaster, toast } from 'sonner';

interface HistoryItem {
  id: string;
  input: string;
  output: string;
  mode: ProcessMode;
  timestamp: number;
}

export default function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<ProcessMode | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isCopied, setIsCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('lingofix-history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  const saveToHistory = (item: HistoryItem) => {
    const newHistory = [item, ...history].slice(0, 50); // Keep last 50
    setHistory(newHistory);
    localStorage.setItem('lingofix-history', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('lingofix-history');
    toast.success('History cleared');
  };

  const handleProcess = async (mode: ProcessMode) => {
    if (!input.trim()) {
      toast.error('Please enter some text first');
      return;
    }

    setIsLoading(true);
    setActiveMode(mode);
    setOutput('');

    try {
      const result = await processText(input, mode);
      if (result) {
        setOutput(result);
        saveToHistory({
          id: Date.now().toString(),
          input,
          output: result,
          mode,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.error('Processing error:', error);
      toast.error('Failed to process text. Please try again.');
    } finally {
      setIsLoading(false);
      setActiveMode(null);
    }
  };

  const copyToClipboard = async (text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy text');
    }
  };

  const loadFromHistory = (item: HistoryItem) => {
    setInput(item.input);
    setOutput(item.output);
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-zinc-200">
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-zinc-900 text-white rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="font-semibold text-xl tracking-tight">LingoFix</h1>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors flex items-center gap-2"
          >
            <History className="w-5 h-5" />
            <span className="hidden sm:inline text-sm font-medium">History</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Input Section */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="input-text" className="text-sm font-medium text-zinc-700">
                Original Text
              </label>
              <textarea
                id="input-text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste or type your text here... (e.g., 'mai app banane ki koshish kar raha ho grammar fix kar do')"
                className="w-full h-64 p-4 rounded-xl border border-zinc-200 bg-white shadow-sm focus:border-zinc-400 focus:ring-0 resize-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => handleProcess('grammar')}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 hover:border-zinc-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-zinc-700 shadow-sm"
              >
                {isLoading && activeMode === 'grammar' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <SpellCheck className="w-4 h-4 text-blue-500" />
                )}
                Fix Grammar
              </button>
              
              <button
                onClick={() => handleProcess('translate')}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 hover:border-zinc-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-zinc-700 shadow-sm"
              >
                {isLoading && activeMode === 'translate' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRightLeft className="w-4 h-4 text-emerald-500" />
                )}
                Translate
              </button>

              <button
                onClick={() => handleProcess('both')}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-sm sm:col-span-3 lg:col-span-1"
              >
                {isLoading && activeMode === 'both' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 text-amber-400" />
                )}
                Fix & Translate
              </button>
            </div>
          </div>

          {/* Output Section */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-700">
                Result
              </label>
              {output && (
                <button
                  onClick={() => copyToClipboard(output)}
                  className="text-zinc-500 hover:text-zinc-900 flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded hover:bg-zinc-100 transition-colors"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {isCopied ? 'Copied' : 'Copy'}
                </button>
              )}
            </div>
            <div className={`w-full h-64 p-4 rounded-xl border ${output ? 'bg-white border-zinc-200 shadow-sm' : 'bg-zinc-100/50 border-dashed border-zinc-200'} overflow-y-auto relative`}>
              {isLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 gap-3">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-sm font-medium">Processing text...</span>
                </div>
              ) : output ? (
                <div className="whitespace-pre-wrap text-zinc-800 leading-relaxed">
                  {output}
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-zinc-400 text-sm">
                  Your corrected text will appear here
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* History Sidebar/Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-zinc-700" />
                <h2 className="font-semibold text-zinc-900">History</h2>
              </div>
              <div className="flex items-center gap-2">
                {history.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    title="Clear History"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-zinc-50/50">
              {history.length === 0 ? (
                <div className="text-center text-zinc-500 py-8 text-sm">
                  No history yet
                </div>
              ) : (
                history.map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm hover:border-zinc-300 transition-colors cursor-pointer group"
                    onClick={() => loadFromHistory(item)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium px-2 py-1 bg-zinc-100 text-zinc-600 rounded-md uppercase tracking-wider">
                        {item.mode === 'both' ? 'Fix & Translate' : item.mode}
                      </span>
                      <span className="text-xs text-zinc-400">
                        {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-sm text-zinc-600 line-clamp-2 mb-2">
                      <span className="font-medium text-zinc-400 mr-2">In:</span>
                      {item.input}
                    </div>
                    <div className="text-sm text-zinc-900 line-clamp-2">
                      <span className="font-medium text-zinc-400 mr-2">Out:</span>
                      {item.output}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
