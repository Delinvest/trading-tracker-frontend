import React, { useState } from 'react';
import { useAccount } from '../contexts/AccountContext';
import { tradesAPI } from '../services/api';

const JournalPage: React.FC = () => {
  const { activeAccount } = useAccount();
  const [formData, setFormData] = useState({
    asset: '',
    entry_price: '',
    take_profit: '',
    stop_loss: '',
    position_size: '',
    pnl_usd: '',
    confidence_score: 5,
    comment: '',
    direction: 'long' as 'long' | 'short',
    trade_date: new Date().toISOString().split('T')[0] // Ajouter la date du jour par défaut
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeAccount) {
      alert('Veuillez sélectionner un compte');
      return;
    }

    setLoading(true);
    setSuccess(false);
    setError('');

    try {
      const tradeData = {
        account_id: activeAccount.id,
        trade_date: new Date(formData.trade_date).toISOString(), // Convertir la date
        asset: formData.asset,
        entry_price: parseFloat(formData.entry_price),
        take_profit: formData.take_profit ? parseFloat(formData.take_profit) : undefined,
        stop_loss: formData.stop_loss ? parseFloat(formData.stop_loss) : undefined,
        position_size: formData.position_size ? parseFloat(formData.position_size) : undefined,
        pnl_usd: formData.pnl_usd ? parseFloat(formData.pnl_usd) : 0,
        confidence_score: formData.confidence_score,
        comment: formData.comment,
        status: 'closed',
        direction: formData.direction
      };

      await tradesAPI.create(tradeData);
      
      setSuccess(true);
      // Reset form
      setFormData({
        asset: '',
        entry_price: '',
        take_profit: '',
        stop_loss: '',
        position_size: '',
        pnl_usd: '',
        confidence_score: 5,
        comment: '',
        direction: 'long',
        trade_date: new Date().toISOString().split('T')[0] // Reset à la date du jour
      });
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors de l\'enregistrement du trade');
    } finally {
      setLoading(false);
    }
  };

  if (!activeAccount) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Journal de Trading</h1>
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
          <p className="text-yellow-800">
            Veuillez créer ou sélectionner un compte pour enregistrer des trades.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Journal de Trading</h1>
      
      {success && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
          <p className="text-green-800 font-medium">✅ Trade enregistré avec succès !</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
          <p className="text-red-800 font-medium">❌ {error}</p>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Asset & Entry */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Actif *
              </label>
              <input
                type="text"
                value={formData.asset}
                onChange={(e) => setFormData({...formData, asset: e.target.value})}
                required
                placeholder="BTC/USDT"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prix d'entrée *
              </label>
              <input
                type="number"
                step="0.00000001"
                value={formData.entry_price}
                onChange={(e) => setFormData({...formData, entry_price: e.target.value})}
                required
                placeholder="50000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Row 2: TP & SL */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Take Profit
              </label>
              <input
                type="number"
                step="0.00000001"
                value={formData.take_profit}
                onChange={(e) => setFormData({...formData, take_profit: e.target.value})}
                placeholder="52000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stop Loss
              </label>
              <input
                type="number"
                step="0.00000001"
                value={formData.stop_loss}
                onChange={(e) => setFormData({...formData, stop_loss: e.target.value})}
                placeholder="49000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Row 3: Position Size & PnL */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taille de position ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.position_size}
                onChange={(e) => setFormData({...formData, position_size: e.target.value})}
                placeholder="1000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PnL (USD) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.pnl_usd}
                onChange={(e) => setFormData({...formData, pnl_usd: e.target.value})}
                required
                placeholder="50.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Row 4: Date du Trade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date du Trade *
            </label>
            <input
              type="date"
              value={formData.trade_date}
              onChange={(e) => setFormData({...formData, trade_date: e.target.value})}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Row 5: Direction */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Direction
            </label>
            <select
              value={formData.direction}
              onChange={(e) => setFormData({...formData, direction: e.target.value as 'long' | 'short'})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="long">Long</option>
              <option value="short">Short</option>
            </select>
          </div>

          {/* Row 6: Confidence Score */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Score de confiance: {formData.confidence_score}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.confidence_score}
              onChange={(e) => setFormData({...formData, confidence_score: parseInt(e.target.value)})}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 (Faible)</span>
              <span>10 (Très élevé)</span>
            </div>
          </div>

          {/* Row 7: Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commentaire
            </label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData({...formData, comment: e.target.value})}
              rows={3}
              placeholder="Notes, analyse, émotions..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Enregistrement...' : 'Enregistrer le trade'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default JournalPage;