const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return customer.init(sequelize, DataTypes);
}

class customer extends Sequelize.Model {
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
    phone_number: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    fullname: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'customer',
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
        name: "customer_id_IDX",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  return customer;
  }
}
