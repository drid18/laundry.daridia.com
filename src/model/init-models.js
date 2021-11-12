const DataTypes = require("sequelize").DataTypes;
const _activity = require("./activity");
const _cash_flow = require("./cash_flow");
const _customer = require("./customer");
const _product = require("./product");
const _transaction = require("./transaction");
const _userapp = require("./userapp");

function initModels(sequelize) {
  const activity = _activity(sequelize, DataTypes);
  const cash_flow = _cash_flow(sequelize, DataTypes);
  const customer = _customer(sequelize, DataTypes);
  const product = _product(sequelize, DataTypes);
  const transaction = _transaction(sequelize, DataTypes);
  const userapp = _userapp(sequelize, DataTypes);


  return {
    activity,
    cash_flow,
    customer,
    product,
    transaction,
    userapp,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
