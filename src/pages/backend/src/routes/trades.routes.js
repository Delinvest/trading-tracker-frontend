const express = require('express');
const router = express.Router();
const { Trade, Account } = require('../models');

// GET /api/trades - Récupérer les trades d'un compte
router.get('/', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    const { account_id } = req.query;

    console.log('=== GET /api/trades ===');
    console.log('User ID from header:', userId);
    console.log('Account ID:', account_id);

    if (!userId) {
      console.log('ERROR: User ID manquant');
      return res.status(401).json({ message: 'User ID manquant' });
    }

    // Vérifier que le compte appartient à l'utilisateur
    if (account_id) {
      const account = await Account.findOne({
        where: { id: account_id, user_id: parseInt(userId) }
      });

      if (!account) {
        console.log('ERROR: Compte non trouvé ou accès refusé');
        return res.status(403).json({ message: 'Accès refusé' });
      }

      const trades = await Trade.findAll({
        where: { account_id: parseInt(account_id) },
        order: [['trade_date', 'ASC']]
      });

      console.log('Trades found:', trades.length);
      console.log('=== TRADES DATA ===');
      trades.forEach((trade, index) => {
        console.log(`Trade ${index + 1}:`);
        console.log(`  - Asset: ${trade.asset}`);
        console.log(`  - Status: ${trade.status}`);
        console.log(`  - Trade Date: ${trade.trade_date}`);
        console.log(`  - Entry Date: ${trade.entry_date}`);
        console.log(`  - PnL USD: ${trade.pnl_usd}`);
        console.log(`  - Entry Price: ${trade.entry_price}`);
      });
      console.log('===================');
      res.json(trades);
    } else {
      // Récupérer tous les trades de l'utilisateur
      const trades = await Trade.findAll({
        include: [{
          model: Account,
          where: { user_id: parseInt(userId) },
          attributes: []
        }],
        order: [['trade_date', 'ASC']]
      });

      console.log('All trades found:', trades.length);
      console.log('=== TRADES DATA ===');
      trades.forEach((trade, index) => {
        console.log(`Trade ${index + 1}:`);
        console.log(`  - Asset: ${trade.asset}`);
        console.log(`  - Status: ${trade.status}`);
        console.log(`  - Trade Date: ${trade.trade_date}`);
        console.log(`  - PnL USD: ${trade.pnl_usd}`);
      });
      console.log('===================');
      res.json(trades);
    }
  } catch (error) {
    console.error('Get trades error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/trades - Créer un nouveau trade
router.post('/', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    const {
      account_id,
      asset,
      entry_price,
      exit_price,
      position_size,
      entry_date,
      exit_date,
      trade_date,
      take_profit,
      stop_loss,
      pnl_usd,
      status,
      comment,
      confidence_score,
      direction
    } = req.body;

    console.log('=== POST /api/trades ===');
    console.log('User ID from header:', userId);
    console.log('Body received:', req.body);

    if (!userId) {
      console.log('ERROR: User ID manquant');
      return res.status(401).json({ message: 'User ID manquant' });
    }

    if (!account_id || !asset || !entry_price) {
      console.log('ERROR: Données manquantes');
      return res.status(400).json({ message: 'Données manquantes' });
    }

    // Vérifier que le compte appartient à l'utilisateur
    const account = await Account.findOne({
      where: { id: account_id, user_id: parseInt(userId) }
    });

    if (!account) {
      console.log('ERROR: Compte non trouvé ou accès refusé');
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const newTrade = await Trade.create({
      account_id: parseInt(account_id),
      asset,
      entry_price: parseFloat(entry_price),
      exit_price: exit_price ? parseFloat(exit_price) : null,
      position_size: position_size ? parseFloat(position_size) : null,
      entry_date: entry_date || new Date(),
      exit_date: exit_date || null,
      trade_date: trade_date || new Date(),
      take_profit: take_profit ? parseFloat(take_profit) : null,
      stop_loss: stop_loss ? parseFloat(stop_loss) : null,
      pnl_usd: pnl_usd ? parseFloat(pnl_usd) : 0,
      status: status || 'open',
      comment: comment || '',
      confidence_score: confidence_score || 5,
      direction: direction || 'long'
    });

    console.log('Trade created:', newTrade.id);
    console.log('Trade details:', {
      id: newTrade.id,
      asset: newTrade.asset,
      status: newTrade.status,
      pnl_usd: newTrade.pnl_usd,
      trade_date: newTrade.trade_date
    });
    res.status(201).json(newTrade);
  } catch (error) {
    console.error('Create trade error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// DELETE /api/trades/:id - Supprimer un trade
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['user-id'];

    console.log('=== DELETE /api/trades/:id ===');
    console.log('User ID from header:', userId);
    console.log('Trade ID:', id);

    if (!userId) {
      console.log('ERROR: User ID manquant');
      return res.status(401).json({ message: 'User ID manquant' });
    }

    // Vérifier que le trade appartient à l'utilisateur
    const trade = await Trade.findOne({
      include: [{
        model: Account,
        where: { user_id: parseInt(userId) },
        attributes: []
      }],
      where: { id }
    });

    if (!trade) {
      console.log('ERROR: Trade non trouvé ou accès refusé');
      return res.status(403).json({ message: 'Accès refusé' });
    }

    await trade.destroy();
    console.log('Trade deleted:', id);
    res.json({ message: 'Trade supprimé' });
  } catch (error) {
    console.error('Delete trade error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/trades/:id - Mettre à jour un trade
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['user-id'];
    const updateData = req.body;

    console.log('=== PUT /api/trades/:id ===');
    console.log('User ID from header:', userId);
    console.log('Trade ID:', id);
    console.log('Update data:', updateData);

    if (!userId) {
      console.log('ERROR: User ID manquant');
      return res.status(401).json({ message: 'User ID manquant' });
    }

    // Vérifier que le trade appartient à l'utilisateur
    const trade = await Trade.findOne({
      include: [{
        model: Account,
        where: { user_id: parseInt(userId) },
        attributes: []
      }],
      where: { id }
    });

    if (!trade) {
      console.log('ERROR: Trade non trouvé ou accès refusé');
      return res.status(403).json({ message: 'Accès refusé' });
    }

    // Mettre à jour le trade
    await trade.update(updateData);
    console.log('Trade updated:', id);
    res.json(trade);
  } catch (error) {
    console.error('Update trade error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;