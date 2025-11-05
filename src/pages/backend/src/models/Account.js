const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Account = sequelize.define('Account', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    account_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    initial_capital: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    current_capital: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: function() { return this.initial_capital; }
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'USD'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'accounts',
    timestamps: false
  });

  return Account;
};