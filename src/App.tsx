
import { useState, useMemo, useEffect } from "react";
import * as THREE from 'three';

import { CryptoUI } from "./components/CryptoUI";
import { CryptoScene } from "./components/CryptoScene";
import type { CryptoData } from "./data/mockData";
import { useIsMobile } from "./hooks/useIsMobile";

type Timeframe = 'day' | 'week' | 'month';
type Metric = 'marketCap' | 'volume24h' | 'performance';

const strongGreen = new THREE.Color('#32CD32');
const strongRed = new THREE.Color('#FF4500');
const neutralColor = new THREE.Color('#A9A9A9');
const getColorFromChange = (change: number) => {
  const newColor = new THREE.Color();
  const maxChange = 10.0;
  const intensity = Math.min(Math.abs(change) / maxChange, 1.0);
  if (change > 0) {
    newColor.lerpColors(neutralColor, strongGreen, intensity);
  } else if (change < 0) {
    newColor.lerpColors(neutralColor, strongRed, intensity);
  } else {
    newColor.copy(neutralColor);
  }
  return newColor;
};

function App() {
  const [timeframe, setTimeframe] = useState<Timeframe>('day');
  const [metric, setMetric] = useState<Metric>('performance');
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [isCameraLocked, setIsCameraLocked] = useState(true); 
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const isMobile = useIsMobile();
  const [isUiVisible, setIsUiVisible] = useState(false); // Inicia cerrado



  useEffect(() => {
    if (!isMobile) {
      setIsUiVisible(true);
    } else {
      setIsUiVisible(false); 
    }
  }, [isMobile]); 

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsPageLoading(true);
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=1&sparkline=false&price_change_percentage=24h,7d,30d'
        );
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();

        const formattedData: CryptoData[] = data.map((coin: any) => ({
          id: coin.id,
          symbol: coin.symbol,
          marketCap: (coin.market_cap || 0) / 1_000_000_000,
          volume24h: (coin.total_volume || 0) / 1_000_000,
          change24h: coin.price_change_percentage_24h_in_currency || 0,
          change7d: coin.price_change_percentage_7d_in_currency || 0,
          change30d: coin.price_change_percentage_30d_in_currency || 0,
        }));

        setCryptoData(formattedData);

      } catch (error) {
        console.error("Error fetching initial crypto data:", error);
        alert("No se pudieron cargar los datos iniciales. Intenta recargar la página.");
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchInitialData();
  }, []); 

  const nodes = useMemo(() => {
    const MAX_RADIUS = 8.0;
    const MIN_RADIUS = 1.0;

    const intermediate = cryptoData.map((crypto) => {

      let displayChange: number;
      switch (timeframe) {
        case 'week': displayChange = crypto.change7d; break;
        case 'month': displayChange = crypto.change30d; break;
        default: displayChange = crypto.change24h;
      }


      let sizeRaw: number;
      let sizeValue: number;
      if (metric === 'performance') {
        sizeRaw = displayChange;
        sizeValue = Math.abs(displayChange);
      } else if (metric === 'marketCap') {
        sizeRaw = crypto.marketCap;
        sizeValue = Math.abs(crypto.marketCap);
      } else {
        sizeRaw = crypto.volume24h;
        sizeValue = Math.abs(crypto.volume24h);
      }

      return { crypto, displayChange, sizeRaw, sizeValue };
    });

    const maxSizeValue = Math.max(...intermediate.map(i => i.sizeValue), 1);

    return intermediate.map(({ crypto, displayChange, sizeRaw, sizeValue }) => {
      const normalized = sizeValue / maxSizeValue; // 0..1
      const radius = MIN_RADIUS + normalized * (MAX_RADIUS - MIN_RADIUS);

      return {
        ...crypto,
        displayChange,
        sizeMetric: metric,
        sizeRaw,
        radius: Math.max(MIN_RADIUS, Math.min(MAX_RADIUS, radius)),
        position: new THREE.Vector3((Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15),
        velocity: new THREE.Vector3(0, 0, 0),
        color: getColorFromChange(displayChange),
      };
    });
  }, [cryptoData, timeframe, metric]);

  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm) return;
    setIsSearchLoading(true);
    const term = searchTerm.toLowerCase();

    const existingNode = cryptoData.find(n => n.id === term || n.symbol.toLowerCase() === term);

    if (existingNode) {
      setSelectedNodeId(existingNode.id);
      setIsCameraLocked(true); 
      setIsSearchLoading(false);
    } else {
      try {

        const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${term}&price_change_percentage=24h,7d,30d`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();

        if (data && data.length > 0) {
          const coin = data[0];

          const newCrypto: CryptoData = {
            id: coin.id,
            symbol: coin.symbol,
            marketCap: (coin.market_cap || 0) / 1_000_000_000, 
            volume24h: (coin.total_volume || 0) / 1_000_000, 
            change24h: coin.price_change_percentage_24h_in_currency || 0,
            change7d: coin.price_change_percentage_7d_in_currency || 0,
            change30d: coin.price_change_percentage_30d_in_currency || 0,
          };

          setCryptoData(prevData => [...prevData, newCrypto]);
          setSelectedNodeId(newCrypto.id);
          setIsCameraLocked(true);
        } else {
          alert("Crypto no encontrada: " + searchTerm);
        }
      } catch (error) {
        console.error("Error fetching crypto data:", error);
        alert("Error al buscar la crypto.");
      } finally {
        setIsSearchLoading(false);
      }
    }
  };


  return (
    <main className="relative w-screen h-screen bg-black">
      
      {isPageLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-white text-2xl font-semibold animate-pulse">
            Cargando datos del mercado...
          </div>
        </div>
      )}

      {isMobile && !isUiVisible && (
        <button
          onClick={() => setIsUiVisible(true)}
          className="absolute top-4 left-4 z-20 p-2 bg-black/50 backdrop-blur-md rounded-lg text-white animate-pulse"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0M3.75 18H7.5m3-6h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0M3.75 12H7.5" />
          </svg>
        </button>
      )}

      <CryptoUI 
        timeframe={timeframe} 
        setTimeframe={setTimeframe} 
        metric={metric} 
        setMetric={setMetric}
        onSearch={(term) => {
          handleSearch(term);
          if (isMobile) setIsUiVisible(false); 
        }} 
        isLoading={isSearchLoading}
        // --- Nuevos props ---
        isVisible={isUiVisible}
        isMobile={isMobile}
        onClose={() => setIsUiVisible(false)}
      />
      
      {!isPageLoading && nodes.length > 0 && (
        <CryptoScene 
          nodes={nodes}
          selectedNodeId={selectedNodeId}
          setSelectedNodeId={setSelectedNodeId}
          isInteracting={isInteracting}
          setIsInteracting={setIsInteracting}
          isCameraLocked={isCameraLocked}
          setIsCameraLocked={setIsCameraLocked}
        />
      )}
    </main>
  );
}

export default App
