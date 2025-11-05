const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Trade = sequelize.define('Trade', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    account_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    asset: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    entry_price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    exit_price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    position_size: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    entry_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    exit_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    trade_date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    take_profit: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    stop_loss: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    pnl_usd: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
    },
    confidence_score: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 5,
    },
    direction: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'long',
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'open',
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'trades',
    timestamps: false,
  });

  return Trade;
};