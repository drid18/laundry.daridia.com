const express = require("express");
const { log4js } = require("../utility/logger");
const { dbmodel, _dbmodel } = require("../model/db");
const logger = log4js.getLogger(require("path").basename(__filename, ".js"));
const axios = require("axios").default;
const { cs } = require("../utility/constants");
const forge = require("node-forge");

class userController {
    static async registerUser(req = express.request) {
        try {
            //Mandatory Field
            var username = req.body.username;
            var password = req.body.password;
            var fullname = req.body.fullname;
            var phone_number = req.body.phone_number;
            var type = req.body.type;

            var md = forge.md.md5.create();
            md.update(password);

            var encryptpass = md.digest().toHex();

            //optional field
            var email = req.body.email ? req.body.email : "-";

            var newuser = await dbmodel.userapp.create({
                cr_time: new Date(),
                mod_time: new Date(),
                username: username,
                password: encryptpass,
                fullname: fullname,
                phone_number: phone_number,
                email: email,
                status: cs.user.status.INACTIVE,
                type: type,
            });

            // if (email != null) newuser.email = email
            await newuser.save();

            return { rc: "00", rm: "success", data: newuser };
        } catch (error) {
            return error;
        }
    }
    static async updateUser(req = express.request) {
        try {
            var userid = req.body.userid;
            var username = req.body.username;
            // var password = req.body.password
            var fullname = req.body.fullname;
            var phone_number = req.body.phone_number;
            var email = req.body.email;
            var type = req.body.type;
            var status = req.body.status;
            var branch = req.body.branch;

            var updateUser = await dbmodel.userapp.findByPk(userid);

            updateUser.mod_time = new Date();
            updateUser.username = username;
            // updateUser.password = password
            updateUser.fullname = fullname;
            updateUser.phone_number = phone_number;
            updateUser.email = email;
            updateUser.type = type;
            updateUser.status = status;
            updateUser.branch = branch;

            await updateUser.save();

            return { rc: "00", rm: "success", data: updateUser };
        } catch (error) {
            logger.error(error);
            return error;
        }
    }

    static async updatePassword(req = express.request) {
        try {
            var userid = req.body.userid;
            var password = req.body.password

            var md = forge.md.md5.create();
            md.update(password);

            var encryptpass = md.digest().toHex();

            var updateUser = await dbmodel.userapp.findByPk(userid);

            updateUser.mod_time = new Date();
            updateUser.password = encryptpass;

            await updateUser.save();

            return { rc: "00", rm: "success", data: updateUser };
        } catch (error) {
            logger.error(error);
            return error;
        }
    }

    static async setUserConfig(req = express.request) {
        try {
            var userid = req.body.userid;
            var branch = req.body.branch;
            var userdata = await dbmodel.userapp.findByPk(userid);
            userdata.info = JSON.stringify({
                branch: branch,
            });
            await userdata.save();
            return { rc: "00", rm: "success" };
        } catch (error) {
            return error;
        }
    }

    static async getUserConfig(req = express.request) {
        try {
            var userid = req.body.userid;
            var userdata = await dbmodel.userapp.findByPk(userid);
            return { rc: "00", rm: "success", data: JSON.parse(userdata.info) };
        } catch (error) {
            return { rc: "99", rm: "failed" };
        }
    }

    static async deleteUser(req = express.request) {
        try {
            var userid = req.body.userid;
            var userdata = await dbmodel.userapp.findOne({ where: { id: userid } });
            await userdata.destroy();
            return { rc: "00", rm: "success" };
        } catch (error) {
            return error;
        }
    }

    static async setStatus(req = express.request) {
        try {
            var userid = req.body.userid;
            var status = req.body.status;
            var userdata = await dbmodel.userapp.findOne({ where: { id: userid } });
            userdata.status = status;
            await userdata.save();
            return { rc: "00", rm: "success", data: userdata };
        } catch (error) {
            return error;
        }
    }

    static async getall(req = express.request) {
        try {
            var [user, meta] = await _dbmodel.query(`
            select
                u.*,
                b.id as cabang_id,
                b.name as cabang_name
            from
                userapp u
            left join branch b on
                u.branch = b.id
            `);
            return { rc: "00", rm: "success", data: user };
        } catch (error) {
            return error;
        }
    }
}
exports.userController = userController;
