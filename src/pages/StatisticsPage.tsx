import React, { useState, useEffect } from 'react';
import { useAccount } from '../contexts/AccountContext';
import { tradesAPI } from '../services/api';
import { Trade } from '../types';

const StatisticsPage: React.FC = () => {
  const { activeAccount } = useAccount();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);

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
      const tradeData = (data || []).map((trade: any) => ({
        ...trade,
        entry_price: Number(trade.entry_price),
        exit_price: trade.exit_price ? Number(trade.exit_price) : null,
        take_profit: trade.take_profit ? Number(trade.take_profit) : null,
        stop_loss: trade.stop_loss ? Number(trade.stop_loss) : null,
        position_size: trade.position_size ? Number(trade.position_size) : null,
        pnl_usd: Number(trade.pnl_usd || 0),
      }));
      setTrades(tradeData);
    } catch (error) {
      console.error('Error loading trades:', error);
    } finally {
      setLoading(false);
    }
  };

  const closedTrades = trades.filter((t) => t.status === 'closed');
  const openTrades = trades.filter((t) => t.status === 'open');

  // Calculate statistics
  const totalTrades = trades.length;
  const winningTrades = closedTrades.filter((t) => Number(t.pnl_usd || 0) > 0).length;
  const losingTrades = closedTrades.filter((t) => Number(t.pnl_usd || 0) < 0).length;

  const totalProfit = closedTrades
    .filter((t) => Number(t.pnl_usd || 0) > 0)
    .reduce((sum, t) => sum + Number(t.pnl_usd || 0), 0);
  const totalLoss = Math.abs(
    closedTrades
      .filter((t) => Number(t.pnl_usd || 0) < 0)
      .reduce((sum, t) => sum + Number(t.pnl_usd || 0), 0)
  );
  const totalPnL = closedTrades.reduce((sum, t) => sum + Number(t.pnl_usd || 0), 0);

  const winRate = closedTrades.length > 0 ? Math.round((winningTrades / closedTrades.length) * 100) : 0;
  const profitFactor = totalLoss > 0 ? (totalProfit / totalLoss).toFixed(2) : '0.00';
  const avgWin = winningTrades > 0 ? (totalProfit / winningTrades).toFixed(2) : '0.00';
  const avgLoss = losingTrades > 0 ? (totalLoss / losingTrades).toFixed(2) : '0.00';
  const expectancy = totalTrades > 0 ? (totalPnL / totalTrades).toFixed(2) : '0.00';

  // Assets distribution
  const assetMap = new Map<string, Trade[]>();
  closedTrades.forEach((trade) => {
    const asset = (trade.asset || 'Unknown') as string;
    if (!assetMap.has(asset)) {
      assetMap.set(asset, []);
    }
    assetMap.get(asset)!.push(trade);
  });

  const assetData: any[] = [];
  assetMap.forEach((trades, asset) => {
    const assetTrades = trades.length;
    const assetWins = trades.filter((t) => Number(t.pnl_usd || 0) > 0).length;
    const assetLosses = trades.filter((t) => Number(t.pnl_usd || 0) < 0).length;
    const assetWinRate = assetTrades > 0 ? Math.round((assetWins / assetTrades) * 100) : 0;
    const assetPnL = trades.reduce((sum, t) => sum + Number(t.pnl_usd || 0), 0);

    assetData.push({
      asset,
      trades: assetTrades,
      wins: assetWins,
      losses: assetLosses,
      winRate: assetWinRate,
      pnl: assetPnL,
    });
  });

  if (loading) {
    return <div className="text-gray-500">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Statistiques</h1>

      {activeAccount && (
        <>
          {/* Global Metrics */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Métriques Globales</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Trades */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <p className="text-xs text-gray-600 font-medium mb-2">Total Trades</p>
                <p className="text-2xl font-bold text-gray-900">{totalTrades}</p>
              </div>

              {/* Win Rate */}
              <div className="bg-green-50 rounded-lg shadow-sm border border-green-200 p-4">
                <p className="text-xs text-green-700 font-medium mb-2">Win Rate</p>
                <p className="text-2xl font-bold text-green-600">{winRate}%</p>
              </div>

              {/* PnL Net */}
              <div className={`rounded-lg shadow-sm border p-4 ${
                totalPnL >= 0
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <p className={`text-xs font-medium mb-2 ${
                  totalPnL >= 0 ? 'text-green-700' : 'text-red-700'
                }`}>PnL Net</p>
                <p className={`text-2xl font-bold ${
                  totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
                </p>
              </div>

              {/* Profit Factor */}
              <div className="bg-purple-50 rounded-lg shadow-sm border border-purple-200 p-4">
                <p className="text-xs text-purple-700 font-medium mb-2">Profit Factor</p>
                <p className="text-2xl font-bold text-purple-600">
                  {profitFactor}
                </p>
              </div>
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {/* Gain Moyen */}
              <div className="bg-green-50 rounded-lg shadow-sm border border-green-200 p-4">
                <p className="text-xs text-green-700 font-medium mb-2">Gain Moyen</p>
                <p className="text-xl font-bold text-green-600">${avgWin}</p>
              </div>

              {/* Perte Moyenne */}
              <div className="bg-red-50 rounded-lg shadow-sm border border-red-200 p-4">
                <p className="text-xs text-red-700 font-medium mb-2">Perte Moyenne</p>
                <p className="text-xl font-bold text-red-600">-${avgLoss}</p>
              </div>

              {/* Expectancy */}
              <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-200 p-4">
                <p className="text-xs text-blue-700 font-medium mb-2">Expectancy</p>
                <p className="text-xl font-bold text-blue-600">${expectancy}</p>
              </div>

              {/* Total Profit */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <p className="text-xs text-gray-600 font-medium mb-2">Total Profit</p>
                <p className="text-xl font-bold text-green-600">${totalProfit.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Performance par Actif */}
          {assetData.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Performance par Actif</h2>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">
                          ACTIF
                        </th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600">
                          TRADES
                        </th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600">
                          WINS
                        </th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600">
                          LOSSES
                        </th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600">
                          WIN RATE
                        </th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                          PNL TOTAL
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {assetData.map((metric, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3 font-semibold text-gray-900">{metric.asset}</td>
                          <td className="px-4 py-3 text-center text-gray-900">{metric.trades}</td>
                          <td className="px-4 py-3 text-center text-green-600 font-semibold">
                            {metric.wins}
                          </td>
                          <td className="px-4 py-3 text-center text-red-600 font-semibold">
                            {metric.losses}
                          </td>
                          <td className="px-4 py-3 text-center font-semibold text-gray-900">
                            {metric.winRate}%
                          </td>
                          <td
                            className={`px-4 py-3 text-right font-bold ${
                              metric.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {metric.pnl >= 0 ? '+' : ''}${metric.pnl.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StatisticsPage;