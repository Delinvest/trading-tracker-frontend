import React, { useState, useEffect } from 'react';
import { useAccount } from '../contexts/AccountContext';
import { tradesAPI } from '../services/api';
import { Trade } from '../types';
import { AccountManager } from '../components/Dashboard/AccountManager';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DashboardPage: React.FC = () => {
  const {
    accounts,
    activeAccount,
    setActiveAccount,
    refreshAccounts,
  } = useAccount();

  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);
  const [equityCurveData, setEquityCurveData] = useState<any[]>([]);

  useEffect(() => {
    if (activeAccount) {
      loadTrades();
    }
  }, [activeAccount]);

  const loadTrades = async () => {
    if (!activeAccount) return;

    setLoading(true);
    try {
      const data = await tradesAPI.getByAccount(activeAccount.id);
      // @ts-ignore
      setTrades(data || []);
      // @ts-ignore
      calculateEquityCurve(data || []);
    } catch (error) {
      console.error('Error loading trades:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateEquityCurve = (allTrades: Trade[]) => {
    let runningCapital = activeAccount?.initial_capital || 0;
    const equityCurveData: any[] = [];

    const closedTrades = allTrades.filter((t) => t.status === 'closed');

    console.log('Closed trades:', closedTrades.length);
    console.log('Starting capital:', runningCapital);

    closedTrades
      .sort((a, b) => {
        const dateA = a.trade_date || a.entry_date || '';
        const dateB = b.trade_date || b.entry_date || '';
        return new Date(dateA).getTime() - new Date(dateB).getTime();
      })
      .forEach((trade, index) => {
        runningCapital += Number(trade.pnl_usd || 0);
        const tradeDate = trade.trade_date || trade.entry_date || new Date().toISOString();
        
        // Créer une date unique pour chaque trade si plusieurs sont le même jour
        const dateObj = new Date(tradeDate);
        dateObj.setHours(dateObj.getHours() + index); // Ajouter des heures pour les séparer visuellement
        
        const formattedDate = dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
        
        console.log(`Trade ${index + 1}: ${trade.asset} | PnL: ${trade.pnl_usd} | Capital: ${runningCapital}`);
        
        equityCurveData.push({
          date: formattedDate,
          capital: Number(runningCapital.toFixed(2)),
          asset: trade.asset,
          pnl: trade.pnl_usd
        });
      });

    console.log('Equity curve data:', equityCurveData);
    setEquityCurveData(equityCurveData);
  };

  const stats = {
    totalTrades: trades.length,
    closedTrades: trades.filter((t) => t.status === 'closed').length,
    totalPnL: trades.reduce((acc, t) => acc + (Number(t.pnl_usd) || 0), 0),
  };

  const currentCapital = activeAccount ? activeAccount.initial_capital + stats.totalPnL : 0;
  const performance = activeAccount && activeAccount.initial_capital > 0
    ? ((currentCapital - activeAccount.initial_capital) / activeAccount.initial_capital) * 100
    : 0;

  return (
    <div className="space-y-6">
      <AccountManager
        accounts={accounts}
        onAccountsChange={refreshAccounts}
        activeAccount={activeAccount}
        onActiveAccountChange={setActiveAccount}
      />

      {activeAccount && (
        <>
          {/* Capital Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Capital Initial */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-sm text-gray-600 font-medium mb-2">Capital Initial</p>
              <p className="text-3xl font-bold text-gray-900">
                ${activeAccount.initial_capital.toFixed(2)}
              </p>
            </div>

            {/* Capital Actuel */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-sm text-gray-600 font-medium mb-2">Capital Actuel</p>
              <p className={`text-3xl font-bold ${currentCapital >= activeAccount.initial_capital ? 'text-green-600' : 'text-red-600'}`}>
                ${currentCapital.toFixed(2)}
              </p>
            </div>

            {/* Performance */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-sm text-gray-600 font-medium mb-2">Performance</p>
              <p className={`text-3xl font-bold ${performance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {performance >= 0 ? '+' : ''}{performance.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Equity Curve */}
          {equityCurveData.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Equity Curve</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={equityCurveData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                    formatter={(value, name) => {
                      if (name === 'capital') return `$${value}`;
                      return value;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="capital"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardPage;