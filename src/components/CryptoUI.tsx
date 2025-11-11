import React, { useState } from 'react';

type Timeframe = 'day' | 'week' | 'month';
type Metric = 'marketCap' | 'volume24h' | 'performance';

type CryptoUIProps = {
  timeframe: Timeframe;
  setTimeframe: (tf: Timeframe) => void;
  metric: Metric;
  setMetric: (m: Metric) => void;
  onSearch: (searchTerm: string) => void;
  isLoading: boolean;
  isMobile: boolean;
};

const labelClass = "text-xs uppercase tracking-widest text-blue-300 font-bold";
const selectClass = "w-full bg-transparent text-white text-sm font-medium focus:outline-none appearance-none cursor-pointer transition-colors duration-200 focus:text-blue-200";
const selectWrapperClass = "relative bg-gradient-to-br from-white/5 to-white/10 border border-white/30 rounded-lg px-4 py-3 hover:border-blue-400/60 hover:from-white/10 hover:to-white/15 transition-all duration-300 focus-within:border-blue-500 focus-within:shadow-lg focus-within:shadow-blue-500/20 focus-within:from-white/15 focus-within:to-white/20 w-full";
const searchInputClass = "pl-4 pr-3 py-3 rounded-l-lg bg-gradient-to-r from-white/5 to-white/10 border border-white/30 border-r-0 text-white text-sm font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 focus:to-white/20 transition-all duration-300 flex-grow";
const searchButtonClass = "px-6 py-3 rounded-r-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold hover:from-blue-500 hover:to-blue-600 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed border border-blue-500/50 active:scale-95";

export const CryptoUI: React.FC<CryptoUIProps> = ({ 
  timeframe, setTimeframe, 
  metric, setMetric,
  onSearch, isLoading ,
  isMobile
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

if (isMobile) {
    return (
      <div 
        className={`
          absolute top-0 left-0 w-full p-4 z-40 flex flex-col gap-4
          bg-gradient-to-b from-black/20 via-black/15 to-transparent backdrop-blur-lg
          border-b border-white/10
          transition-all duration-300
        `}
      >
        <div className="flex flex-col gap-3">
          {isSearchOpen && (
            <div className="space-y-2">
              <label className={labelClass}>Buscar</label>
              <form onSubmit={handleSubmit} className="flex w-full gap-0">
                <input
                  type="text"
                  placeholder="Bitcoin, ETH..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={searchInputClass}
                  aria-label="Search cryptocurrency"
                  autoFocus
                />
                <button type="submit" className={searchButtonClass} disabled={isLoading} aria-label="Search">
                  {isLoading ? (
                    <span className="inline-block animate-spin">⟳</span>
                  ) : (
                    <span>→</span>
                  )}
                </button>
              </form>
            </div>
          )}
          
          <div className={`grid gap-3 ${isSearchOpen ? 'grid-cols-1' : 'grid-cols-3'}`}>
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`p-1.5 rounded-lg border transition-all duration-200 flex items-center justify-center ${
                isSearchOpen
                  ? 'bg-gradient-to-br from-white/15 to-white/20 border-blue-500 shadow-lg shadow-blue-500/20'
                  : 'bg-gradient-to-br from-white/5 to-white/10 border-white/30 hover:border-blue-400/60'
              }`}
              aria-label="Toggle search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-blue-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.5 5.5a7.5 7.5 0 0010.5 10.5z" />
              </svg>
            </button>

            <div className="space-y-2">
              <label className={labelClass}>Tamaño</label>
              <div className={selectWrapperClass}>
                <select 
                  value={metric} 
                  onChange={(e) => setMetric(e.target.value as Metric)} 
                  className={selectClass}
                  aria-label="Select size metric"
                >
                  <option value="marketCap" className="text-black">Market Cap</option>
                  <option value="volume24h" className="text-black">Volumen</option>
                  <option value="performance" className="text-black">Performance</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-blue-300">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className={labelClass}>Período</label>
              <div className={selectWrapperClass}>
                <select 
                  value={timeframe} 
                  onChange={(e) => setTimeframe(e.target.value as Timeframe)} 
                  className={selectClass}
                  aria-label="Select timeframe"
                >
                  <option value="day" className="text-black">24h</option>
                  <option value="week" className="text-black">7d</option>
                  <option value="month" className="text-black">30d</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-blue-300">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`
      absolute top-0 left-0 w-full p-5 z-10 
      flex flex-col md:flex-row gap-6 md:gap-8
      justify-between items-stretch md:items-center
      bg-gradient-to-b from-black/20 via-black/15 to-transparent backdrop-blur-lg
      border-b border-white/10
      transition-all duration-300
      z-[101]
    `}>
      
      <form onSubmit={handleSubmit} className="flex w-full md:flex-1 md:max-w-md gap-0">
        <input
          type="text"
          placeholder="Buscar crypto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={searchInputClass}
          aria-label="Search cryptocurrency"
        />
        <button type="submit" className={searchButtonClass} disabled={isLoading} aria-label="Search">
          {isLoading ? (
            <span className="inline-block animate-spin">⟳</span>
          ) : (
            <span>→</span>
          )}
        </button>
      </form>
      
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-6 flex-1 md:flex-initial">
        <div className="flex flex-col gap-2 flex-1 md:flex-initial md:min-w-[180px]">
          <label className={labelClass}>Tamaño por:</label>
          <div className={selectWrapperClass}>
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value as Metric)}
              className={selectClass}
              aria-label="Select size metric"
            >
              <option value="marketCap" className="text-black">Market Cap</option>
              <option value="volume24h" className="text-black">Volumen (24h)</option>
              <option value="performance" className="text-black">Performance</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-blue-300">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 flex-1 md:flex-initial md:min-w-[180px]">
          <label className={labelClass}>Período:</label>
          <div className={selectWrapperClass}>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as Timeframe)}
              className={selectClass}
              aria-label="Select timeframe"
            >
              <option value="day" className="text-black">Día (24h)</option>
              <option value="week" className="text-black">Semana (7d)</option>
              <option value="month" className="text-black">Mes (30d)</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-blue-300">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};