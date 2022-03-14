const express = require('express')
const { log4js } = require('../utility/logger')
const { dbmodel } = require('../model/db')
const logger = log4js.getLogger(require('path').basename(__filename, '.js'))
const axios = require("axios").default;
const { cs } = require('../utility/constants');
const forge = require("node-forge");

class sessionController {
    static async login(req = express.request) {
        try {
            var username = req.body.username
            var password = req.body.password
            var md = forge.md.md5.create();
            md.update(password);
            console.log(md.digest().toHex());
            var userlogin = await dbmodel.userapp.findOne({ where: { username: username, password: md.digest().toHex() } })
            if (userlogin) {
                if (userlogin.status === 0) {
                    return ({ rc: "99", rm: "Pengguna anda belum aktif, silahkan hubungi admin untuk mengaktifkan akun anda" })
                }
                if (userlogin.status === 2) {
                    return ({ rc: "99", rm: "Pengguna anda sudah diblokir, silahkan hubungi admin untuk mengaktifkan akun anda" })
                }
                if (userlogin.type === 2 && userlogin.branch === null) {
                    return ({ rc: "99", rm: "Cabang akun anda belum di tentukan, silahkan hubungi admin untuk mengatur cabang untuk akun anda" })
                }
                req.session.userid = userlogin.id
                req.session.username = userlogin.username
                req.session.data = userlogin.toJSON()
                return ({ rc: "00", rm: "success", data: userlogin.toJSON(), session: req.session })
            } else {
                return ({ rc: "99", rm: "Nama pengguna/kata sandi anda tidak sesuai" })
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