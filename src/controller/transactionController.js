const express = require('express')
const { log4js } = require('../utility/logger')
const { dbmodel, _dbmodel } = require('../model/db')
const logger = log4js.getLogger(require('path').basename(__filename, '.js'))
const axios = require("axios").default;
const { cs } = require('../utility/constants');

class transactionController {
    static async addTransaction(req = express.request) {
        try {
            var user = req.body.user
            var customer = req.body.customer
            var product = req.body.product
            var payment = req.body.payment
            var amount = req.body.amount
            var status = req.body.status

            var newTransaction = await dbmodel.transaction.create({
                cr_time: new Date(),
                mod_time: new Date(),
                user: user,
                customer: customer,
                product: product,
                payment: payment,
                amount: amount,
                status: status
            })
            return ({ rc: "00", rm: "success", data: newTransaction })
        } catch (error) {
            return (error)
        }
    }

    static async editTransaction(req = express.request) {
        try {
            var id = req.body.id
            var user = req.body.user
            var customer = req.body.customer
            var product = req.body.product
            var payment = req.body.payment
            var amount = req.body.amount
            var status = req.body.status

            var updateTransaction = await dbmodel.transaction.update({
                mod_time: new Date(),
                user: user,
                customer: customer,
                product: product,
                payment: payment,
                amount: amount,
                status: status
            }, { where: { id: id } })
            return ({ rc: "00", rm: "success" })
        } catch (error) {
            logger.error(error)
            return (error)
        }
    }

    static async deleteTransaction(req = express.request) {
        try {
            var id = req.body.id
            var transaction = await dbmodel.transaction.findByPk(id)
            await transaction.destroy()
            return ({ rc: "00", rm: "success" })
        } catch (error) {
            logger.error(error)
            return (error)
        }
    }

    static async getAll(req = express.request) {
        try {
            var [transaction, meta] = await _dbmodel.query('select * from `transaction` t')
            return ({ rc: "00", rm: "success", data: transaction })
        } catch (error) {
            return (error)
        }
    }

    static async gettoday(req = express.request) {
        try {
            var [transaction, meta] = await _dbmodel.query('select * from `transaction` t where date(cr_time) = curdate() ')
            return ({ rc: "00", rm: "success", data: transaction })
        } catch (error) {
            return (error)
        }
    }

    static async getundone(req = express.request) {
        try {
            var [transaction, meta] = await _dbmodel.query('select * from `transaction` t where t.status != 1')
            return ({ rc: "00", rm: "success", data: transaction })
        } catch (error) {
            return (error)
        }
    }

} exports.transactionController = transactionController