import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, X, Send } from 'lucide-react';

// Add Google Fonts
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

// Import fallback logos directly
import amazonLogoFallback from './assets/amazon-logo.svg';
import aliexpressLogoFallback from './assets/aliexpress-logo.svg';
import temuLogoFallback from './assets/temu-logo.svg';

// Define types
interface Deal {
  id: string;
  title: string;
  description: string;
  importance: 'high' | 'medium' | 'low';
  link: string;
  active: boolean;
}

interface StoreData {
  name: string;
  logo: string;
  bgColor: string;
  color: string;
  active: boolean;
  deals: Deal[];
}

type Store = string | null;

// Define fallback data for stores
const fallbackLogos: Record<string, string> = {
  amazon: amazonLogoFallback,
  aliexpress: aliexpressLogoFallback,
  temu: temuLogoFallback
};

const fallbackColors: Record<string, string> = {
  amazon: 'bg-orange-500',
  aliexpress: 'bg-[#e43225]',
  temu: 'bg-[#fb7701]'
};

const fallbackBgColors: Record<string, string> = {
  amazon: 'from-orange-500 to-yellow-500',
  aliexpress: 'from-[#e43225] to-[#c62a20]',
  temu: 'from-[#fb7701] to-[#f06000]'
};

function App() {
  const [stores, setStores] = useState<Record<string, StoreData>>({});
  const [storeIds, setStoreIds] = useState<string[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState<{text: string, sender: 'user' | 'bot'}[]>([
    {text: 'Hi there! How can I help with your shopping today?', sender: 'bot'}
  ]);

  // Fetch store data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/data');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const data = await response.json();
        
        if (data.stores && Object.keys(data.stores).length > 0) {
          setStores(data.stores);
          setStoreIds(Object.keys(data.stores));
        }
      } catch (error) {
        console.error('Error fetching store data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleStoreClick = (store: Store) => {
    setSelectedStore(store === selectedStore ? null : store);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      setChatMessages([...chatMessages, {text: message, sender: 'user'}]);
      
      // Simulate bot response
      setTimeout(() => {
        setChatMessages(prev => [
          ...prev, 
          {
            text: selectedStore 
              ? `I found some great deals on ${stores[selectedStore]?.name || selectedStore}! Check them out above.` 
              : 'Select a store to see personalized deals!', 
            sender: 'bot'
          }
        ]);
      }, 1000);
      
      setMessage('');
    }
  };

  // Render store button with fallbacks for missing data
  const renderStoreButton = (storeId: string, store: StoreData) => {
    // Use fallbacks if data is missing
    const logo = store.logo || fallbackLogos[storeId] || '';
    const color = store.color || fallbackColors[storeId] || '';
    const name = store.name || storeId;
    
    return (
      <motion.button
        key={storeId}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        className={`${
          color
        } w-32 h-32 md:w-36 md:h-36 rounded-full flex items-center justify-center flex-col gap-3 shadow-lg hover:shadow-2xl transition-shadow relative group overflow-hidden`}
        onClick={() => handleStoreClick(storeId)}
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-white/20 group-hover:bg-white/30 transition-colors"
          whileHover={{ scale: 1.2, opacity: 0 }}
        />
        <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-white rounded-full shadow-inner z-10 p-3">
          <img 
            src={logo} 
            alt={`${name} logo`} 
            className="w-full h-full object-contain"
            onError={(e) => {
              const target = e.target;
              if (target instanceof HTMLImageElement) {
                target.src = fallbackLogos[storeId];
              }
            }}
          />
        </div>
        <span className="text-base md:text-lg font-bold capitalize z-10">{name}</span>
      </motion.button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => {
          const uniqueId = `particle-${i}-${Math.random().toString(36).substring(2, 7)}`;
          return (
            <motion.div
              key={uniqueId}
              className="absolute w-2 h-2 bg-white/10 rounded-full"
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                scale: 0
              }}
              animate={{ 
                y: [null, Math.random() * window.innerHeight],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: Math.random() * 2
              }}
            />
          );
        })}
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-12 md:pt-16 pb-12 relative z-10"
        >
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text p-4"
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ 
              duration: 5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear"
            }}
          >
            Smart Shopping, Smarter Deals
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Discover AI-curated deals from your favorite stores, personalized just for you.
          </motion.p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500" />
          </div>
        )}

        {/* Store Section */}
        {!loading && (
          <div className="relative mb-8 md:mb-4">
            <AnimatePresence mode="wait">
              {!selectedStore && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-center items-center gap-6 py-8"
                >
                  {storeIds.map((storeId) => {
                    const store = stores[storeId];
                    return renderStoreButton(storeId, store);
                  })}
                </motion.div>
              )}

              {selectedStore && stores[selectedStore] && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center py-8"
                >
                  <motion.button
                    initial={{ scale: 0.5, y: 20 }}
                    animate={{ 
                      scale: 1, 
                      y: 0,
                      transition: { type: "spring", stiffness: 100, damping: 15 }
                    }}
                    className={`bg-gradient-to-b ${
                      stores[selectedStore].bgColor || fallbackBgColors[selectedStore]
                    } w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center flex-col gap-2 mb-8 relative group cursor-pointer overflow-hidden`}
                    onClick={() => handleStoreClick(null)}
                  >
                    <motion.div
                      className="absolute inset-0 rounded-full bg-white/20"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.3, 0.2]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut"
                      }}
                    />
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center z-10 p-2">
                      <img 
                        src={stores[selectedStore].logo || fallbackLogos[selectedStore]} 
                        alt={`${stores[selectedStore].name} logo`} 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const target = e.target;
                          if (target instanceof HTMLImageElement) {
                            target.src = fallbackLogos[selectedStore];
                          }
                        }}
                      />
                    </div>
                    <span className="text-sm font-bold capitalize z-10">{stores[selectedStore].name}</span>
                  </motion.button>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl mx-auto px-4"
                  >
                    {stores[selectedStore].deals.map((deal, index) => (
                      <motion.div
                        key={deal.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          transition: { delay: index * 0.1 },
                        }}
                        whileHover={{ scale: 1.02 }}
                        className={`
                          p-5 rounded-lg backdrop-blur-md bg-white/10 cursor-pointer
                          transform transition-all duration-200 hover:shadow-xl
                          ${deal.importance === 'high' ? 'md:col-span-2 lg:col-span-1' : ''}
                          ${
                            deal.importance === 'high'
                              ? 'border-2 border-yellow-400/50 shadow-yellow-400/20'
                              : deal.importance === 'medium'
                              ? 'border border-gray-400/30'
                              : ''
                          }
                        `}
                      >
                        <h3 className="text-lg font-bold mb-2">{deal.title}</h3>
                        <p className="text-gray-300 text-sm">{deal.description}</p>
                        {deal.importance === 'high' && (
                          <Sparkles className="absolute top-4 right-4 text-yellow-400" size={16} />
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* AI Assistant Button - Responsive positioning */}
        <AnimatePresence>
          {!isChatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="md:relative fixed bottom-8 left-0 right-0 mx-auto z-40 flex justify-center md:py-4"
            >
              <motion.button
                type="button"
                className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-500 py-4 px-7 rounded-full shadow-lg cursor-pointer border border-blue-400/30 hover:shadow-blue-500/25 transition-shadow"
                whileHover={{ scale: 1.05, boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsChatOpen(true)}
              >
                <Bot className="text-white" size={24} />
                <p className="text-white font-medium">Ask AI Shopping Assistant</p>
                <Sparkles className="text-yellow-400" size={16} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Window */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={(e) => {
                // Close when clicking the backdrop, not the chat window
                if (e.target === e.currentTarget) {
                  setIsChatOpen(false);
                }
              }}
            >
              <motion.div 
                className="w-full max-w-lg h-[550px] max-h-[90vh] bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl shadow-2xl overflow-hidden flex flex-col border border-gray-700"
                onClick={(e) => e.stopPropagation()}
                layoutId="chatWindow"
                initial={{ y: 50 }}
                animate={{ y: 0 }}
              >
                {/* Chat Header */}
                <div className="bg-gray-900 p-4 flex justify-between items-center border-b border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-blue-500/20">
                      <Bot className="text-blue-400" size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Shopping Assistant</h3>
                      <p className="text-xs text-gray-400">Powered by AI</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsChatOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800"
                  >
                    <X size={18} />
                  </button>
                </div>
                
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                  <AnimatePresence>
                    {chatMessages.map((msg, i) => {
                      const uniqueId = `chat-msg-${i}-${msg.text.substring(0, 10)}`;
                      return (
                        <motion.div
                          key={uniqueId}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          {msg.sender === 'bot' && (
                            <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center mr-2 mt-1">
                              <Bot size={16} className="text-blue-400" />
                            </div>
                          )}
                          <div 
                            className={`max-w-[80%] p-3 rounded-lg ${
                              msg.sender === 'user' 
                                ? 'bg-blue-600 text-white rounded-br-none' 
                                : 'bg-gray-700/70 text-white rounded-bl-none'
                            }`}
                          >
                            {msg.text}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
                
                {/* Chat Input */}
                <div className="p-4 border-t border-gray-700 bg-gray-900">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask about deals or products..."
                      className="flex-1 bg-gray-800 text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700"
                    />
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1, backgroundColor: '#2563eb' }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleSendMessage}
                      className="bg-blue-600 text-white p-3 rounded-full"
                    >
                      <Send size={18} />
                    </motion.button>
                  </div>
                  <div className="mt-3 flex items-center gap-3 justify-center">
                    {['Best deals?', 'Compare stores', 'Gift ideas'].map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => {
                          setChatMessages([...chatMessages, {
                            text: suggestion, 
                            sender: 'user'
                          }]);
                          setTimeout(() => {
                            setChatMessages(prev => [
                              ...prev, 
                              {
                                text: suggestion === 'Best deals?' 
                                  ? "Today's best deals are on electronics at Amazon and home goods at Temu. Would you like me to show specific categories?"
                                  : suggestion === 'Compare stores'
                                  ? "Amazon typically offers faster shipping and better customer service, while AliExpress and Temu have lower prices but longer shipping times."
                                  : "Popular gift ideas right now include smart home devices, personalized accessories, and subscription boxes. What's your budget?", 
                                sender: 'bot'
                              }
                            ]);
                          }, 1000);
                        }}
                        className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full border border-gray-700"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Authority and Trust Section */}
        <div className="max-w-4xl mx-auto text-center py-16 md:pt-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center p-6 rounded-xl bg-white/5 backdrop-blur-sm"
            >
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <title>Verified Shield Icon</title>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Deals</h3>
              <p className="text-gray-400 text-sm">All deals are manually verified for authenticity and value</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center p-6 rounded-xl bg-white/5 backdrop-blur-sm"
            >
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <title>Real-time Updates Icon</title>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-Time Updates</h3>
              <p className="text-gray-400 text-sm">Prices and availability updated in real-time</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col items-center p-6 rounded-xl bg-white/5 backdrop-blur-sm"
            >
              <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <title>24/7 Support Icon</title>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-400 text-sm">AI-powered support available around the clock</p>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 border-t border-gray-800">
          <div className="max-w-7xl mx-auto py-12 px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-2">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text mb-4">
                  Interactive Shopping
                </h3>
                <p className="text-gray-400 max-w-md">
                  Your AI-powered shopping companion. We help you discover the best deals across multiple platforms.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Legal</h4>
                <ul className="space-y-2">
                  <li>
                    <a href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="/affiliate-disclosure" className="text-gray-400 hover:text-white transition-colors">
                      Affiliate Disclosure
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Support</h4>
                <ul className="space-y-2">
                  <li>
                    <button 
                      type="button"
                      onClick={() => setIsChatOpen(true)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Chat with AI
                    </button>
                  </li>
                  <li>
                    <a href="mailto:support@stores.deals" className="text-gray-400 hover:text-white transition-colors">
                      Email Support
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
              © {new Date().getFullYear()} Interactive Shopping. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;