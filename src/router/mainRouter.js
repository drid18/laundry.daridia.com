const express = require('express')
const { mainController } = require('../controller/mainController')
const { dbmodel } = require('../model/db')
const { log4js } = require('../utility/logger')
const logger = log4js.getLogger(require('path').basename(__filename, '.js'))

class mainRouter {
    static async init(app = express()) {
        logger.info("--> initials mainRouter")

        app.get('/*', async function (req = express.request) {
            logger.info("request: " + req.path + " GET")
            logger.info("param: " + JSON.stringify(req.query) + " GET")

            var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

            var activity = await dbmodel.activity.create({
                path: req.path,
                ip: ip,
                req_time: new Date(),
                req_body: JSON.stringify(req.query)
            })
            await activity.save()

            var response = { rc: "99", rm: "somethings went wrong :(" }
            switch (req.path) {
                case '/test':
                    response = await mainController.servertest(req)
                    break;
                default:
                    response = { rc: 99, rm: "path not found" }
                    break;
            }

            activity.res_time = new Date()
            activity.res_body = JSON.stringify(response).length < 1000 ? JSON.stringify(response) : "response too long..."
            await activity.save()

            req.res.send(response)
        })
    }
} exports.mainRouter = mainRouter