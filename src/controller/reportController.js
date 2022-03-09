const express = require('express')
const { log4js } = require('../utility/logger')
const { dbmodel, _dbmodel } = require('../model/db')
const logger = log4js.getLogger(require('path').basename(__filename, '.js'))
const axios = require("axios").default;
const { cs } = require('../utility/constants');

class reportController {
    static async getCustomerTransactionPerMonth(req = express.request) {
        try {
            var month = req.query.m
            var year = req.query.y

            var [result, meta] = await _dbmodel.query(/*sql */`
                select
                    c.*,
                    count(t.customer) as sum_trx
                from
                    customer c
                left join \`transaction\` t on
                    t.customer = c.phone_number
                where
                    ${year ? ("date_format(t.cr_time, '%Y') = " + year) : ("date_format(t.cr_time, '%Y') = " + new Date().getFullYear())}
                    ${month ? ("and date_format(t.cr_time, '%m') = " + month) : ''}
                group by
                    t.customer
                order by
                    sum_trx desc
            `)
            return ({ rc: "00", rm: "success", data: result })
        } catch (error) {
            return (error)
        }
    }

    static async getTransactionByPaidDate(req = express.request) {
        try {
            var month = req.query.m
            var year = req.query.y
            var date = req.query.d

            var [result, meta] = await _dbmodel.query(/*sql */`
                select
                    *
                from
                    \`transaction\` t
                left join branch b on
	                b.id = t.branch
                where
                    ${year ? ("date_format(t.paid_date, '%Y') = " + year) : ("date_format(t.paid_date, '%Y') = " + new Date().getFullYear())}
                    ${month ? ("and date_format(t.paid_date, '%m') = " + month) : ''}
                    ${date ? ("and date_format(t.paid_date, '%d') = " + date) : ''}
                    ${req.query.b ? 'and t.branch=' + req.query.b : ''}
            `)
            var totalAmount = 0
            for (let index = 0; index < result.length; index++) {
                const element = result[index];
                totalAmount += parseInt(element.amount)
            }
            return ({ rc: "00", rm: "success", data: result, total: totalAmount })
        } catch (error) {
            return (error)
        }
    }
    static async getTransactionByTrxDate(req = express.request) {
        try {
            var month = req.query.m
            var year = req.query.y
            var date = req.query.d

            var [result, meta] = await _dbmodel.query(/*sql */`
                select
                    *
                from
                    \`transaction\` t
                left join branch b on
	                b.id = t.branch
                where
                    ${year ? ("date_format(t.cr_time, '%Y') = " + year) : ("date_format(t.cr_time, '%Y') = " + new Date().getFullYear())}
                    ${month ? ("and date_format(t.cr_time, '%m') = " + month) : ''}
                    ${date ? ("and date_format(t.cr_time, '%d') = " + date) : ''}
                    ${req.query.b ? 'and t.branch=' + req.query.b : ''}
            `)

            var totalAmount = 0
            for (let index = 0; index < result.length; index++) {
                const element = result[index];
                totalAmount += parseInt(element.amount)
            }
            return ({ rc: "00", rm: "success", data: result, total: totalAmount })
        } catch (error) {
            return (error)
        }
    }

} exports.reportController = reportController