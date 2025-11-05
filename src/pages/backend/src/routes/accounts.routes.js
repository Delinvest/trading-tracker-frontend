const express = require('express');
const router = express.Router();
const { Account, User } = require('../models');

// GET /api/accounts - Récupérer tous les comptes de l'utilisateur
router.get('/', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    
    console.log('=== GET /api/accounts ===');
    console.log('Headers received:', req.headers);
    console.log('User ID from header:', userId);
    
    if (!userId) {
      console.log('ERROR: User ID manquant');
      return res.status(401).json({ message: 'User ID manquant' });
    }

    const accounts = await Account.findAll({ 
      where: { user_id: parseInt(userId) }
    });

    console.log('Accounts found:', accounts.length);
    res.json(accounts);
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/accounts - Créer un nouveau compte
router.post('/', async (req, res) => {
  try {
    const { account_name, initial_capital } = req.body;
    const userId = req.headers['user-id'];

    console.log('=== POST /api/accounts ===');
    console.log('Headers received:', req.headers);
    console.log('User ID from header:', userId);
    console.log('Body received:', req.body);

    if (!userId) {
      console.log('ERROR: User ID manquant');
      return res.status(401).json({ message: 'User ID manquant' });
    }

    if (!account_name || !initial_capital) {
      console.log('ERROR: Données manquantes');
      return res.status(400).json({ message: 'Données manquantes' });
    }

    const newAccount = await Account.create({
      user_id: parseInt(userId),
      account_name,
      initial_capital: parseFloat(initial_capital),
      current_capital: parseFloat(initial_capital),
      currency: 'USD'
    });

    console.log('Account created:', newAccount.id);
    res.status(201).json(newAccount);
  } catch (error) {
    console.error('Create account error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// DELETE /api/accounts/:id - Supprimer un compte
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['user-id'];

    console.log('=== DELETE /api/accounts/:id ===');
    console.log('Headers received:', req.headers);
    console.log('User ID from header:', userId);
    console.log('Account ID:', id);

    if (!userId) {
      console.log('ERROR: User ID manquant');
      return res.status(401).json({ message: 'User ID manquant' });
    }

    const account = await Account.findOne({
      where: { id, user_id: parseInt(userId) }
    });

    if (!account) {
      console.log('ERROR: Compte non trouvé');
      return res.status(404).json({ message: 'Compte non trouvé' });
    }

    await account.destroy();
    console.log('Account deleted:', id);
    res.json({ message: 'Compte supprimé' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;