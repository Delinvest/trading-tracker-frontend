import React, { useState } from 'react';
import { TradingAccount as Account } from '../../types';
import { accountsAPI } from '../../services/api';

interface AccountManagerProps {
  accounts: Account[];
  onAccountsChange: () => void;
  activeAccount: Account | null;
  onActiveAccountChange: (account: Account) => void;
}

export const AccountManager: React.FC<AccountManagerProps> = ({
  accounts,
  onAccountsChange,
  activeAccount,
  onActiveAccountChange,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [initialCapital, setInitialCapital] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateAccount = async () => {
    if (!accountName || !initialCapital) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await accountsAPI.create({
        account_name: accountName,
        initial_capital: parseFloat(initialCapital)
      });

      setAccountName('');
      setInitialCapital('');
      setIsModalOpen(false);
      onAccountsChange();
    } catch (err) {
      setError('Erreur lors de la création du compte');
      console.error('Error creating account:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce compte ?')) {
      return;
    }

    try {
      await accountsAPI.delete(id);
      onAccountsChange();
      
      if (activeAccount?.id === id) {
        onActiveAccountChange(accounts[0]);
      }
    } catch (err) {
      console.error('Error deleting account:', err);
      alert('Erreur lors de la suppression du compte');
    }
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Mes Comptes</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          +
          Ajouter un compte
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
          Créez un compte ci-dessus pour commencer à tracker vos trades.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <div
              key={account.id}
              onClick={() => onActiveAccountChange(account)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                activeAccount?.id === account.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-blue-400'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{account.account_name}</h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteAccount(account.id);
                  }}
                  className="text-red-500 hover:text-red-700 transition text-xl"
                >
                  🗑️
                </button>
              </div>
              <p className="text-gray-600 text-sm">Capital: ${(account.current_capital || account.initial_capital).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-6">Créer un compte</h2>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Nom du compte
              </label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Alpha Capital"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Capital initial ($)
              </label>
              <input
                type="number"
                value={initialCapital}
                onChange={(e) => setInitialCapital(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 10000"
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setError('');
                  setAccountName('');
                  setInitialCapital('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateAccount}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-gray-400"
              >
                {loading ? 'Création...' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};