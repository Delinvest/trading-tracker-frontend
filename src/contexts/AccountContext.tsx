import React, { createContext, useContext, useState, useEffect } from 'react';
import { TradingAccount as Account } from '../types';
import { accountsAPI } from '../services/api';

interface AccountContextType {
  accounts: Account[];
  activeAccount: Account | null;
  loading: boolean;
  setActiveAccount: (account: Account) => void;
  refreshAccounts: () => Promise<void>;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const AccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeAccount, setActiveAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshAccounts = async () => {
    setLoading(true);
    try {
      const data = await accountsAPI.getAccounts();
      setAccounts(data);
      if (data.length > 0 && !activeAccount) {
        setActiveAccount(data[0]);
      }
    } catch (error) {
      console.error('Failed to load accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAccounts();
  }, []);

  return (
    <AccountContext.Provider value={{ accounts, activeAccount, loading, setActiveAccount, refreshAccounts }}>
      {children}
    </AccountContext.Provider>
  );
};

export const useAccount = () => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccount must be used within AccountProvider');
  }
  return context;
};