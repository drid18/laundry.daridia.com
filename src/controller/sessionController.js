const express = require('express')
const { log4js } = require('../utility/logger')
const { dbmodel } = require('../model/db')
const logger = log4js.getLogger(require('path').basename(__filename, '.js'))
const axios = require("axios").default;
const { cs } = require('../utility/constants');

class sessionController {
    static async login(req = express.request) {
        try {
            var username = req.body.username
            var password = req.body.password
            var userlogin = await dbmodel.userapp.findOne({ where: { username: username, password: password } })
            if (userlogin) {
                req.session.userid = userlogin.id
                req.session.username = userlogin.username
                return ({ rc: "00", rm: "success", data: userlogin, session: req.session })
            } else {
                return ({ rc: "99", rm: "user and password didn't match" })
            }
        } catch (error) {
            return (error)
        }
    }

    static async checksession(req = express.request) {
        try {
            if (req.session.userid) {
                return ({ rc: "00", rm: "success", session: req.session })
            } else {
                return ({ rc: "99", rm: "session not found" })
            }
        } catch (error) {
            return (error)
        }
    }

    static async logout(req = express.request) {
        try {
            req.session.destroy();
            return ({ rc: "00", rm: "success" })
        } catch (error) {
            return (error)
        }
    }

} exports.sessionController = sessionController