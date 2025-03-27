import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, X, Send } from 'lucide-react';
import { Link } from '@tanstack/react-router';

// Import brand logos
import amazonLogo from '../assets/amazon-logo.svg';
import aliexpressLogo from '../assets/aliexpress-logo.svg';
import temuLogo from '../assets/temu-logo.svg';

type Store = 'amazon' | 'aliexpress' | 'temu' | null;

interface Deal {
  id?: string;
  title: string;
  description: string;
  importance: 'high' | 'medium' | 'low';
  link?: string;
  active?: boolean;
}

interface StoreData {
  name: string;
  logo: string;
  bgColor: string;
  color: string;
  active: boolean;
  deals: Deal[];
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

// Fallback store data
const fallbackStoreDeals: Record<string, Deal[]> = {
  amazon: [
    { title: 'Just-added Deals', description: 'Fresh deals added daily', importance: 'medium' },
    { title: 'Trending Deals', description: 'Most popular right now', importance: 'high' },
    { title: 'Top Anticipated', description: 'Upcoming sales events', importance: 'medium' },
    { title: 'Creator Favorites', description: 'Recommended by influencers', importance: 'high' },
    { title: 'Spring Fashion', description: 'Latest seasonal trends', importance: 'medium' },
    { title: 'Best of Beauty', description: 'Top-rated beauty products', importance: 'low' },
  ],
  aliexpress: [
    { title: 'Flash Deals', description: 'Limited-time offers', importance: 'high' },
    { title: 'New User Deals', description: 'Special first-purchase offers', importance: 'medium' },
    { title: 'Superdeals', description: 'Best prices guaranteed', importance: 'high' },
    { title: 'Clearance', description: 'Last chance items', importance: 'low' },
  ],
  temu: [
    { title: 'Daily Picks', description: 'Hand-selected deals', importance: 'high' },
    { title: 'Under $1', description: 'Incredible savings', importance: 'medium' },
    { title: 'New Arrivals', description: 'Just landed', importance: 'medium' },
    { title: 'Bundle Deals', description: 'Save more buying together', importance: 'high' },
  ],
};

const storeColors = {
  amazon: 'bg-orange-500',
  aliexpress: 'bg-[#e43225]',
  temu: 'bg-[#fb7701]',
};

const storeBgColors = {
  amazon: 'from-orange-500 to-yellow-500',
  aliexpress: 'from-[#e43225] to-[#c62a20]',
  temu: 'from-[#fb7701] to-[#f06000]',
};

const storeLogos = {
  amazon: amazonLogo,
  aliexpress: aliexpressLogo,
  temu: temuLogo,
};

export function App() {
  const [selectedStore, setSelectedStore] = useState<Store>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-message',
      text: 'Hi there! How can I help with your shopping today?',
      sender: 'bot'
    }
  ]);
  const [storeDeals, setStoreDeals] = useState<Record<string, Deal[]>>(fallbackStoreDeals);
  const [isLoading, setIsLoading] = useState(true);
  const [storeData, setStoreData] = useState<Record<string, StoreData>>({});

  // Fetch store data from API
  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        console.log('Fetching store data...');
        const response = await fetch('/api/data');
        if (!response.ok) {
          throw new Error('Failed to fetch store data');
        }
        
        const data = await response.json();
        console.log('Data received:', data);
        
        // If we have data from the D1 database or KV store, use it
        if (data.stores && Object.keys(data.stores).length > 0) {
          // Save the full store data
          setStoreData(data.stores);
          
          // Transform stores data into deals format expected by the component
          const deals: Record<string, Deal[]> = {};
          
          for (const [storeId, storeData] of Object.entries(data.stores)) {
            const store = storeData as StoreData;
            if (store.active && store.deals) {
              deals[storeId] = store.deals.filter(deal => deal.active);
            }
          }
          
          setStoreDeals(deals);
        }
      } catch (error) {
        console.error('Error fetching store data:', error);
        // Fallback to predefined data in case of error
        setStoreDeals(fallbackStoreDeals);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStoreData();
  }, []);

  const generateMessageId = () => {
    return `msg-${Math.random().toString(36).substring(2, 15)}-${Date.now()}`;
  };

  const handleStoreClick = (store: Store) => {
    setSelectedStore(store === selectedStore ? null : store);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      const userMessageId = generateMessageId();
      const botMessageId = generateMessageId();
      
      setChatMessages(prev => [...prev, {
        id: userMessageId,
        text: message,
        sender: 'user'
      }]);
      
      // Simulate bot response
      setTimeout(() => {
        setChatMessages(prev => [
          ...prev,
          {
            id: botMessageId,
            text: selectedStore 
              ? `I found some great deals on ${selectedStore}! Check them out above.` 
              : 'Select a store to see personalized deals!',
            sender: 'bot'
          }
        ]);
      }, 1000);
      
      setMessage('');
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => {
          // Create a static key without Date.now() to prevent re-rendering
          const uniqueId = `particle-${i}-${Math.random().toString(36).substring(2, 15)}`;
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
        {/* Add a loading indicator */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500" />
          </div>
        )}
      
        {/* Only show content when not loading */}
        {!isLoading && (
          <>
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
                stores.deals
              </motion.h1>
              <motion.p 
                className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-semibold mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Your Smart Shopping Universe
              </motion.p>
              <motion.p 
                className="text-xl text-gray-300 max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Compare deals across stores instantly with AI-powered precision. Amazon, AliExpress, and Temu - all in one place.
              </motion.p>
            </motion.div>

            {/* Store Section */}
            <div className="relative mb-8 md:mb-4">
              <AnimatePresence mode="wait">
                {!selectedStore && (
                  <motion.div
                    key="store-selection"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-6 py-8"
                  >
                    <div className="flex justify-center items-center gap-6">
                      {Object.keys(storeDeals).map((store) => {
                        // Use store data from API if available, otherwise fallback
                        const hasStoreData = storeData[store] !== undefined;
                        const storeName = hasStoreData ? storeData[store].name : store;
                        const storeColor = hasStoreData ? storeData[store].color : storeColors[store as keyof typeof storeColors];
                        const storeLogo = hasStoreData ? storeData[store].logo : storeLogos[store as keyof typeof storeLogos];
                        
                        return (
                          <motion.button
                            key={store}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                            className={`${
                              storeColor
                            } w-24 h-24 md:w-36 md:h-36 rounded-full flex items-center justify-center flex-col gap-3 shadow-lg hover:shadow-2xl transition-shadow relative group overflow-hidden`}
                            onClick={() => handleStoreClick(store as Store)}
                          >
                            <motion.div
                              className="absolute inset-0 rounded-full bg-white/20 group-hover:bg-white/30 transition-colors"
                              whileHover={{ scale: 1.2, opacity: 0 }}
                            />
                            <div className="flex items-center justify-center w-12 h-12 md:w-20 md:h-20 bg-white rounded-full shadow-inner z-10 p-3">
                              <img 
                                src={storeLogo} 
                                alt={`${storeName} logo`} 
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = storeLogos[store as keyof typeof storeLogos];
                                }}
                              />
                            </div>
                            <span className="text-sm md:text-lg font-bold capitalize z-10 hidden md:block">{storeName}</span>
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* AI Assistant Button - Desktop */}
                    <div className="hidden md:block">
                      <motion.button
                        type="button"
                        className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-500 py-4 px-7 rounded-full shadow-lg cursor-pointer border border-blue-400/30"
                        whileHover={{ scale: 1.05, boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5)' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsChatOpen(true)}
                      >
                        <Bot className="text-white" size={24} />
                        <p className="text-white font-medium">Ask AI Shopping Assistant</p>
                        <Sparkles className="text-yellow-400" size={16} />
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Mobile Floating Chat Button */}
                <motion.div
                  key="mobile-chat-button"
                  className="fixed bottom-4 right-4 md:hidden z-50"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <motion.button
                    type="button"
                    className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full shadow-lg cursor-pointer border border-blue-400/30"
                    whileHover={{ scale: 1.05, boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsChatOpen(true)}
                  >
                    <Bot className="text-white" size={24} />
                  </motion.button>
                </motion.div>

                {selectedStore && (
                  <motion.div
                    key="selected-store-view"
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
                        storeData[selectedStore]?.bgColor || storeBgColors[selectedStore]
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
                          src={storeData[selectedStore]?.logo || storeLogos[selectedStore]} 
                          alt={`${storeData[selectedStore]?.name || selectedStore} logo`} 
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = storeLogos[selectedStore];
                          }}
                        />
                      </div>
                      <span className="text-sm font-bold capitalize z-10">{storeData[selectedStore]?.name || selectedStore}</span>
                    </motion.button>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl mx-auto px-4"
                    >
                      {storeDeals[selectedStore].map((deal, index) => (
                        <motion.div
                          key={deal.title}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            transition: { delay: index * 0.1 },
                          }}
                          whileHover={{ scale: 1.02 }}
                          className={"bg-white/10 backdrop-blur-lg rounded-lg p-6 relative overflow-hidden group"}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 group-hover:from-white/10 transition-colors" />
                          <h3 className="text-xl font-semibold mb-2 relative z-10">{deal.title}</h3>
                          <p className="text-gray-300 relative z-10">{deal.description}</p>
                          {deal.importance === 'high' && (
                            <div className="absolute top-2 right-2">
                              <Sparkles className="w-5 h-5 text-yellow-400" />
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Chat Window - Centered with optimal UX */}
            <AnimatePresence>
              {isChatOpen && (
                <motion.div
                  key="chat-window"
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
                          <h3 className="font-bold text-white">stores.deals Assistant</h3>
                          <p className="text-xs text-gray-400">AI-Powered Shopping Guide</p>
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
                      <AnimatePresence mode="popLayout">
                        {chatMessages.map((msg) => (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
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
                        ))}
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
                        {['Best deals?', 'Compare stores', 'Gift ideas'].map((suggestion, index) => (
                          <button
                            key={`suggestion-${index}-${suggestion.toLowerCase().replace(/\s+/g, '-')}`}
                            type="button"
                            onClick={() => {
                              const userMessageId = generateMessageId();
                              const botMessageId = generateMessageId();
                              
                              setChatMessages(prev => [...prev, {
                                id: userMessageId,
                                text: suggestion,
                                sender: 'user'
                              }]);
                              
                              setTimeout(() => {
                                setChatMessages(prev => [
                                  ...prev,
                                  {
                                    id: botMessageId,
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
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="py-12 md:py-16"
            >
              <div className="max-w-4xl mx-auto text-center px-4">
                <h2 className="text-3xl md:text-4xl font-bold mb-8">Why Trust Our Platform?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white/5 backdrop-blur-lg rounded-lg p-6">
                    <div className="text-blue-400 mb-4">
                      <Bot className="w-8 h-8 mx-auto" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">AI-Powered</h3>
                    <p className="text-gray-300">Smart algorithms that learn your preferences</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-lg rounded-lg p-6">
                    <div className="text-purple-400 mb-4">
                      <Sparkles className="w-8 h-8 mx-auto" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Curated Deals</h3>
                    <p className="text-gray-300">Hand-picked offers from trusted stores</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-lg rounded-lg p-6">
                    <div className="text-pink-400 mb-4">
                      <Bot className="w-8 h-8 mx-auto" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
                    <p className="text-gray-300">Always here to help you shop smarter</p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Footer */}
            <footer className="py-8 border-t border-white/10">
              <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">About Us</h3>
                    <p className="text-gray-300">Your trusted companion for smart online shopping.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Stores</h3>
                    <ul className="space-y-2">
                      <li><a href="#amazon" className="text-gray-300 hover:text-white">Amazon</a></li>
                      <li><a href="#aliexpress" className="text-gray-300 hover:text-white">AliExpress</a></li>
                      <li><a href="#temu" className="text-gray-300 hover:text-white">Temu</a></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Support</h3>
                    <ul className="space-y-2">
                      <li><a href="#help-center" className="text-gray-300 hover:text-white">Help Center</a></li>
                      <li><a href="#contact-us" className="text-gray-300 hover:text-white">Contact Us</a></li>
                      <li><a href="#faqs" className="text-gray-300 hover:text-white">FAQs</a></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Legal</h3>
                    <ul className="space-y-2">
                      <li>
                        <Link to="/privacy-policy" className="text-gray-300 hover:text-white">
                          Privacy Policy
                        </Link>
                      </li>
                      <li>
                        <Link to="/affiliate-disclosure" className="text-gray-300 hover:text-white">
                          Affiliate Disclosure
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t border-white/10 text-center text-gray-300">
                  <p>&copy; {new Date().getFullYear()} Deals Stores. All rights reserved.</p>
                </div>
              </div>
            </footer>
          </>
        )}
      </div>
    </div>
  );
} 