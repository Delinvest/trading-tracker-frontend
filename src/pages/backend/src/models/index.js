const sequelize = require('../config/database');
const User = require('./User')(sequelize);
const Account = require('./Account')(sequelize);
const Trade = require('./Trade')(sequelize);

// Définir les associations
User.hasMany(Account, { foreignKey: 'user_id' });
Account.belongsTo(User, { foreignKey: 'user_id' });

Account.hasMany(Trade, { foreignKey: 'account_id' });
Trade.belongsTo(Account, { foreignKey: 'account_id' });

module.exports = {
  sequelize,
  User,
  Account,
  Trade
};
