const initModels = require("./init-models");
const { Sequelize } = require('sequelize');
const db_connection = new Sequelize(require("../../config/conf.json").dbconf, {
    logging: false,
    define: {
        freezeTableName: true,
        timestamps: false
    }
})

const init = initModels(db_connection)
exports.dbmodel = init
exports._dbmodel = db_connection