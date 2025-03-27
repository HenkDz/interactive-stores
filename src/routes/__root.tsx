import React from 'react';
import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { Menu, X, Bot, ShoppingBag, Heart, Bell, User } from 'lucide-react';

function RootLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <nav className="border-b border-white/10 backdrop-blur-lg bg-gray-900/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and brand */}
            <div className="flex-shrink-0">
              <Link 
                to="/" 
                className="flex items-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <ShoppingBag className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
                  stores.deals
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-8">
              <Link
                to="/amazon"
                className="text-gray-300 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
              >
                Amazon
              </Link>
              <Link
                to="/aliexpress"
                className="text-gray-300 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
              >
                AliExpress
              </Link>
              <Link
                to="/temu"
                className="text-gray-300 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
              >
                Temu
              </Link>
              <Link
                to="/deals"
                className="text-gray-300 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
              >
                Top Deals
              </Link>
            </div>

            {/* Right side icons */}
            <div className="hidden md:flex items-center gap-4">
              <button
                type="button"
                className="text-gray-300 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
                aria-label="AI Assistant"
              >
                <Bot className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="text-gray-300 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
                aria-label="Saved Items"
              >
                <Heart className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="text-gray-300 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="text-gray-300 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
                aria-label="User Account"
              >
                <User className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-300 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/10">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/amazon"
                className="block text-gray-300 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Amazon
              </Link>
              <Link
                to="/aliexpress"
                className="block text-gray-300 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                AliExpress
              </Link>
              <Link
                to="/temu"
                className="block text-gray-300 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Temu
              </Link>
              <Link
                to="/deals"
                className="block text-gray-300 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Top Deals
              </Link>
              <div className="flex items-center gap-4 px-3 py-2">
                <button
                  type="button"
                  className="text-gray-300 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
                  aria-label="AI Assistant"
                >
                  <Bot className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="text-gray-300 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
                  aria-label="Saved Items"
                >
                  <Heart className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="text-gray-300 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="text-gray-300 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
                  aria-label="User Account"
                >
                  <User className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
}); 