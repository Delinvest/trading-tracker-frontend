import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAccount } from '../../contexts/AccountContext';
import { LayoutDashboard, BookOpen, LineChart, BarChart3, LogOut } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { activeAccount, accounts, setActiveAccount } = useAccount();

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Journal', path: '/journal', icon: BookOpen },
    { name: 'Trades', path: '/trades', icon: LineChart },
    { name: 'Statistiques', path: '/statistics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 shadow-xl">
        <div className="max-w-full mx-auto px-8 py-4">
          <div className="flex justify-between items-center">
            {/* Logo - Extrême gauche */}
            <div className="flex items-center gap-4 min-w-[280px]">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm p-2 rounded-lg">
                <LayoutDashboard className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">L'Art du Trading</h1>
                <p className="text-blue-100 text-xs font-medium">Track Record Pro</p>
              </div>
            </div>
            
            {/* Account Selector - Centre */}
            {accounts.length > 0 && (
              <select
                value={activeAccount?.id || ''}
                onChange={(e) => {
                  const account = accounts.find(a => a.id === Number(e.target.value));
                  if (account) setActiveAccount(account);
                }}
                className="px-5 py-2.5 border-2 border-white bg-white bg-opacity-10 text-white rounded-lg focus:ring-2 focus:ring-white backdrop-blur-sm font-medium hover:bg-opacity-20 transition-all cursor-pointer"
              >
                {accounts.map(account => (
                  <option key={account.id} value={account.id} className="text-gray-900 bg-white">
                    {account.account_name}
                  </option>
                ))}
              </select>
            )}

            {/* User et Déconnexion - Extrême droite */}
            <div className="flex items-center gap-4 min-w-[280px] justify-end">
              <div className="text-right">
                <p className="text-white font-semibold">{user?.username}</p>
                <p className="text-blue-100 text-xs">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-5 py-2.5 bg-white bg-opacity-20 text-white hover:bg-opacity-30 rounded-lg transition-all backdrop-blur-sm font-medium border border-white border-opacity-30 hover:border-opacity-50"
              >
                <LogOut size={18} />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <nav className="w-64 bg-white shadow-sm min-h-[calc(100vh-81px)]">
          <div className="p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;