import React, { useState, useEffect } from 'react';
import { useAccount } from '../contexts/AccountContext';
import { tradesAPI } from '../services/api';
import { Trade } from '../types';
import { Eye, Trash2 } from 'lucide-react';

const TradesPage: React.FC = () => {
  const { activeAccount } = useAccount();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

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
        confidence: trade.confidence_score ? Number(trade.confidence_score) : (trade.confidence ? Number(trade.confidence) : null),
      })) as any;
      setTrades(tradeData);
    } catch (error) {
      console.error('Error loading trades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrade = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this trade?')) return;

    try {
      await tradesAPI.delete(id);
      setTrades(trades.filter((t) => t.id !== id));
      setSelectedTrade(null);
    } catch (error) {
      console.error('Error deleting trade:', error);
      alert('Error deleting trade');
    }
  };

  const sortedTrades = [...trades].sort(
    (a, b) => {
      const dateA = a.trade_date || a.entry_date || '';
      const dateB = b.trade_date || b.entry_date || '';
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    }
  );

  if (loading) {
    return <div className="text-gray-500">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mes Trades</h1>

      {activeAccount && (
        <>
          {sortedTrades.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <p className="text-gray-500">No trades yet. Create your first trade!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sortedTrades.map((trade) => (
                <div
                  key={trade.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  {/* Header avec Asset, Date et Status */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{trade.asset || 'N/A'}</h3>
                      <p className="text-sm text-gray-500">
                        {trade.trade_date
                          ? new Date(trade.trade_date).toLocaleDateString('fr-FR')
                          : trade.entry_date
                          ? new Date(trade.entry_date).toLocaleDateString('fr-FR')
                          : 'N/A'}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        trade.status === 'open'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {trade.status === 'open' ? 'Open' : 'Fermé'}
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Entrée:</span>
                      <span className="font-semibold text-gray-900">
                        ${Number(trade.entry_price || 0).toFixed(2)}
                      </span>
                    </div>
                    {trade.exit_price && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Sortie:</span>
                        <span className="font-semibold text-gray-900">
                          ${Number(trade.exit_price).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">PnL:</span>
                      <span style={{ color: Number(trade.pnl_usd || 0) >= 0 ? '#16a34a' : '#dc2626', fontWeight: '600' }}>
                        {Number(trade.pnl_usd || 0) >= 0 ? '+' : ''}${Number(trade.pnl_usd || 0).toFixed(2)}
                      </span>
                    </div>
                    {(trade as any).confidence && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Confiance:</span>
                        <span className="font-semibold text-gray-900">{(trade as any).confidence}/10</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Row */}
                  <div className="flex gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTrade(trade);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors font-medium text-sm"
                    >
                      <Eye size={16} />
                      Voir
                    </button>
                    <button
                      onClick={(e) => handleDeleteTrade(trade.id, e)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Trade Detail Modal */}
          {selectedTrade && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedTrade(null)}
            >
              <div
                className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900">{selectedTrade.asset || 'N/A'}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedTrade.trade_date
                        ? new Date(selectedTrade.trade_date).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'N/A'}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedTrade(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                {/* Main Details */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Prix entrée</span>
                    <span className="font-bold text-gray-900">
                      ${Number(selectedTrade.entry_price || 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Statut</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        selectedTrade.status === 'open'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {selectedTrade.status === 'open' ? 'Open' : 'Fermé'}
                    </span>
                  </div>

                  {selectedTrade.exit_price && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Prix sortie</span>
                      <span className="font-bold text-gray-900">
                        ${Number(selectedTrade.exit_price).toFixed(2)}
                      </span>
                    </div>
                  )}

                  {selectedTrade.take_profit && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Take Profit</span>
                      <span className="font-bold text-gray-900">
                        ${Number(selectedTrade.take_profit).toFixed(2)}
                      </span>
                    </div>
                  )}

                  {selectedTrade.stop_loss && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stop Loss</span>
                      <span className="font-bold text-gray-900">
                        ${Number(selectedTrade.stop_loss).toFixed(2)}
                      </span>
                    </div>
                  )}

                  {selectedTrade.position_size && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Position Size</span>
                      <span className="font-bold text-gray-900">
                        ${Number(selectedTrade.position_size).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* PnL Box */}
                <div
                  style={{
                    backgroundColor: Number(selectedTrade.pnl_usd || 0) >= 0 ? '#f0fdf4' : '#fef2f2',
                    borderColor: Number(selectedTrade.pnl_usd || 0) >= 0 ? '#86efac' : '#fecaca',
                    borderWidth: '1px',
                    padding: '16px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    marginBottom: '24px'
                  }}
                >
                  <p className="text-sm text-gray-600 mb-2">PnL</p>
                  <p
                    style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: Number(selectedTrade.pnl_usd || 0) >= 0 ? '#16a34a' : '#dc2626'
                    }}
                  >
                    {Number(selectedTrade.pnl_usd || 0) >= 0 ? '+' : ''}
                    ${Number(selectedTrade.pnl_usd || 0).toFixed(2)}
                  </p>
                </div>

                {/* Comment */}
                {selectedTrade.comment && (
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <p className="text-sm text-gray-600 font-medium mb-2">Commentaire</p>
                    <p className="text-gray-700">{selectedTrade.comment}</p>
                  </div>
                )}

                {/* Close Button */}
                <button
                  onClick={() => setSelectedTrade(null)}
                  className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg transition-colors font-medium"
                >
                  Fermer
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TradesPage;