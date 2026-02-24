import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, LayoutDashboard, CreditCard, LogOut, Calendar } from 'lucide-react';
import { Button } from './ui';

interface LayoutProps {
  children: React.ReactNode;
  userEmail?: string;
  onSignOut?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, userEmail, onSignOut }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { path: '/cron', label: 'Scheduled Tasks', icon: <Calendar className="w-4 h-4" /> },
    { path: '/billing', label: 'Billing', icon: <CreditCard className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-dark border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link 
              to="/dashboard" 
              className="flex items-center space-x-2 text-primary-500 hover:text-primary-400 transition-colors"
            >
              <Sparkles className="w-8 h-8" />
              <span className="text-2xl font-bold">OpenPaw</span>
            </Link>
            
            {userEmail && (
              <div className="flex items-center space-x-6">
                <div className="hidden md:flex items-center space-x-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                        isActive(link.path)
                          ? 'bg-primary-500/10 text-primary-400 font-semibold'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {link.icon}
                      <span>{link.label}</span>
                    </Link>
                  ))}
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className="text-gray-300 text-sm hidden sm:inline">
                    {userEmail}
                  </span>
                  {onSignOut && (
                    <Button
                      onClick={onSignOut}
                      variant="danger"
                      size="sm"
                      icon={<LogOut className="w-4 h-4" />}
                    >
                      <span className="hidden sm:inline">Sign Out</span>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
