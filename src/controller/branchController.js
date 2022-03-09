const express = require('express')
const { log4js } = require('../utility/logger')
const { dbmodel } = require('../model/db')
const logger = log4js.getLogger(require('path').basename(__filename, '.js'))
const axios = require("axios").default;
const { cs } = require('../utility/constants');

class branchController {
    static async addBranch(req = express.request) {
        try {
            var name = req.body.name
            var address = req.body.address

            var newBranch = await dbmodel.branch.create({
                name: name,
                address: address
            })
            return ({ rc: "00", rm: "success", data: newBranch })
        } catch (error) {
            return (error)
        }
    }

    static async updateBranch(req = express.request) {
        try {
            var id = req.body.id
            var name = req.body.name
            var address = req.body.address

            var updateBranch = await dbmodel.branch.update({
                name: name,
                address: address
            }, { where: { id: id } })

            return ({ rc: "00", rm: "success", data: updateBranch })
        } catch (error) {
            return (error)
        }
    }

    static async deleteBranch(req = express.request) {
        try {
            var branchid = req.body.id
            var branch = await dbmodel.branch.findByPk(branchid)
            branch.destroy()
            return ({ rc: "00", rm: "success" })
        } catch (error) {
            return (error)
        }
    }

    static async getall(req = express.request) {
        try {
            var branch = await dbmodel.branch.findAll()
            return ({ rc: "00", rm: "success", data: branch })
        } catch (error) {
            return (error)
        }
    }
    
    static async getbyid(req = express.request) {
        try {
            var branch = await dbmodel.branch.findByPk(req.body.id)
            return ({ rc: "00", rm: "success", data: branch })
        } catch (error) {
            return (error)
        }
    }

} exports.branchController = branchController