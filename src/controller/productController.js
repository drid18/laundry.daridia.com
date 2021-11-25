const express = require('express')
const { log4js } = require('../utility/logger')
const { dbmodel } = require('../model/db')
const logger = log4js.getLogger(require('path').basename(__filename, '.js'))
const axios = require("axios").default;
const { cs } = require('../utility/constants');

class productController {
    static async addProduct(req = express.request) {
        try {
            var name = req.body.name
            var description = req.body.description
            var rules = { price: req.body.price, unit: 'KG' }

            var newProduct = await dbmodel.product.create({
                cr_time: new Date(),
                mod_time: new Date(),
                name: name,
                description: description,
                rules: JSON.stringify(rules),
                status: cs.product.status.INACTIVE
            })
            return ({ rc: "00", rm: "success", data: newProduct })
        } catch (error) {
            return (error)
        }
    }

    static async updateProduct(req = express.request) {
        try {
            var id = req.body.id
            var name = req.body.name
            var description = req.body.description
            var rules = { price: req.body.price, unit: 'KG' }
            var status = req.body.status

            // var updateProduct = await dbmodel.product.findByPk(id)
            var updateProduct = await dbmodel.product.update({
                mod_time: new Date(),
                name: name,
                description: description,
                rules: JSON.stringify(rules),
                status: status
            }, { where: { id: id } })

            return ({ rc: "00", rm: "success" })
        } catch (error) {
            return (error)
        }
    }

    static async deleteProduct(req = express.request) {
        try {
            var productid = req.body.id
            var product = await dbmodel.product.findByPk(productid)
            product.destroy()
            return ({ rc: "00", rm: "success" })
        } catch (error) {
            return (error)
        }
    }

    static async getall(req = express.request) {
        try {
            var product = await dbmodel.product.findAll()
            return ({ rc: "00", rm: "success", data: product })
        } catch (error) {
            return (error)
        }
    }

} exports.productController = productController