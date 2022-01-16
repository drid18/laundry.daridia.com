const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return transaction.init(sequelize, DataTypes);
}

class transaction extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    cr_time: {
      type: DataTypes.DATE,
      allowNull: false
    },
    mod_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    user: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    customer: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    product: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    data: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    payment: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    branch: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    paid_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    finish_date: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'transaction',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "transaction_id_IDX",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  return transaction;
  }
}
