const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return appconfig.init(sequelize, DataTypes);
}

class appconfig extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  super.init({
    configid: {
      type: DataTypes.STRING(100),
      allowNull: false,
      primaryKey: true
    },
    desc: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'appconfig',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "configid" },
        ]
      },
    ]
  });
  return appconfig;
  }
}
