const DataTypes = require("sequelize").DataTypes;
const _branch = require("./branch");

function initModels(sequelize) {
  const branch = _branch(sequelize, DataTypes);


  return {
    branch,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
