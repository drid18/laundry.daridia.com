const express = require('express')
const { log4js } = require('../utility/logger')
const { dbmodel, _dbmodel } = require('../model/db')
const logger = log4js.getLogger(require('path').basename(__filename, '.js'))
const axios = require("axios").default;
const { cs } = require('../utility/constants');

class customerController {
    static async addCustomer(req = express.request) {
        try {
            var fullname = req.body.fullname
            var phone_number = req.body.phone_number
            var address = req.body.address ? req.body.address : null;

            var newCustomer = await dbmodel.customer.create({
                cr_time: new Date(),
                mod_time: new Date(),
                fullname: fullname,
                phone_number: phone_number,
                address: address
            })
            return ({ rc: "00", rm: "success", data: newCustomer })
        } catch (error) {
            return (error)
        }
    }

    static async updateCustomer(req = express.request) {
        try {
            var id = req.body.id
            var fullname = req.body.fullname
            var phone_number = req.body.phone_number
            var address = req.body.address ? req.body.address : null;

            var updateCustomer = await dbmodel.customer.update({
                mod_time: new Date(),
                fullname: fullname,
                phone_number: phone_number,
                address: address
            }, { where: { id: id } })
            return ({ rc: "00", rm: "success" })
        } catch (error) {
            return (error)
        }
    }

    static async deleteCustomer(req = express.request) {
        try {
            var id = req.body.id
            var customer = await dbmodel.customer.findByPk(id)
            customer.destroy()
            return ({ rc: "00", rm: "success" })
        } catch (error) {
            return (error)
        }
    }

    static async getAll(req = express.request) {
        try {
            var id = req.body.id
            var customer = await dbmodel.customer.findAll(id)
            return ({ rc: "00", rm: "success", data: customer })
        } catch (error) {
            return (error)
        }
    }

    static async findbyphone(req = express.request) {
        try {
            var number = req.body.number
            var [customer, meta] = await _dbmodel.query(`select * from customer c where lower(c.phone_number)  like '%${number}%'`)
            return ({ rc: "00", rm: "success", data: customer })
        } catch (error) {
            return (error)
        }
    }

    static async findbyname(req = express.request) {
        try {
            var name = req.body.name
            var [customer, meta] = await _dbmodel.query(`select * from customer c where lower(c.fullname)  like '%${name}%'`)
            return ({ rc: "00", rm: "success", data: customer })
        } catch (error) {
            return (error)
        }
    }

} exports.customerController = customerController