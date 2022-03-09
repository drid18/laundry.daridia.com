const express = require('express')
const { log4js } = require('../utility/logger')
const { dbmodel } = require('../model/db')
const logger = log4js.getLogger(require('path').basename(__filename, '.js'))
const axios = require("axios").default;
const { cs } = require('../utility/constants');

class configController {
    static async setConfig(req = express.request) {
        try {

            /*
            {
            "DICOUNT_VALUE": "10",
            "FLEXIBLE_DISCOUNT": true,
            "IS_DISCOUNT_ENABLED": true,
            "LANDRY_ADDRESS": "Jl Bunggasi Poros Anduonohu, Toko SMART PRABOT, Kel. Anduonohu, Kec. Poasia",
            "LANDRY_PHONE_NUMBER": "082196740580",
            "LAUNDRY_LOGO_URL": null,
            "LAUNDRY_NAME": "Laundry DariDia Express"
            }
            */

            var DICOUNT_VALUE = req.body.DICOUNT_VALUE
            var FLEXIBLE_DISCOUNT = req.body.FLEXIBLE_DISCOUNT
            var IS_DISCOUNT_ENABLED = req.body.IS_DISCOUNT_ENABLED
            var LANDRY_ADDRESS = req.body.LANDRY_ADDRESS
            var LANDRY_PHONE_NUMBER = req.body.LANDRY_PHONE_NUMBER
            var LAUNDRY_LOGO_URL = req.body.LAUNDRY_LOGO_URL
            var LAUNDRY_NAME = req.body.LAUNDRY_NAME

            var configcontainer;

            configcontainer = await dbmodel.appconfig.update(
                { value: DICOUNT_VALUE },
                { where: { configid: 'DICOUNT_VALUE' } }
            )
            configcontainer = await dbmodel.appconfig.update(
                { value: FLEXIBLE_DISCOUNT },
                { where: { configid: 'FLEXIBLE_DISCOUNT' } }
            )
            configcontainer = await dbmodel.appconfig.update(
                { value: IS_DISCOUNT_ENABLED },
                { where: { configid: 'IS_DISCOUNT_ENABLED' } }
            )
            configcontainer = await dbmodel.appconfig.update(
                { value: LANDRY_ADDRESS },
                { where: { configid: 'LANDRY_ADDRESS' } }
            )
            configcontainer = await dbmodel.appconfig.update(
                { value: LANDRY_PHONE_NUMBER },
                { where: { configid: 'LANDRY_PHONE_NUMBER' } }
            )
            configcontainer = await dbmodel.appconfig.update(
                { value: LAUNDRY_LOGO_URL },
                { where: { configid: 'LAUNDRY_LOGO_URL' } }
            )
            configcontainer = await dbmodel.appconfig.update(
                { value: LAUNDRY_NAME },
                { where: { configid: 'LAUNDRY_NAME' } }
            )
            return ({ rc: "00", rm: "success"})
        } catch (error) {
            console.error(error);
            return (error)
        }
    }

    static async getDefaultConfig(req = express.request) {
        try {

            var config = await dbmodel.appconfig.findAll();

            var configdata = {};
            for (let x = 0; x < config.length; x++) {
                var element = config[x].value
                if (element === "true") element = true;
                if (element === "false") element = false;
                configdata[config[x].configid] = element
            }

            console.log(configdata);

            return (configdata)
        } catch (error) {
            console.log(error);
            return (error)
        }
    }

} exports.configController = configController