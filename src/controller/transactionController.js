const express = require('express')
const { log4js } = require('../utility/logger')
const { dbmodel, _dbmodel } = require('../model/db')
const logger = log4js.getLogger(require('path').basename(__filename, '.js'))
const axios = require("axios").default;
const { cs } = require('../utility/constants');

Date.prototype.addHours = function (h) {
    this.setTime(this.getTime() + (h * 60 * 60 * 1000));
    return this;
}


class transactionController {
    static async addTransaction(req = express.request) {
        try {
            logger.info('add new transaction ', new Date().addHours(8))

            var user = req.body.user
            var customer = req.body.customer
            var product = req.body.product
            var payment = req.body.payment
            var amount = req.body.amount
            var status = req.body.status
            var data = req.body.data
            var branch = req.body.branch

            var dataparse = JSON.parse(data)

            var checkcustomer = await dbmodel.customer.findOne({ where: { phone_number: customer } })
            if (!checkcustomer) {
                logger.info('new customer')
                var newCustomer = await dbmodel.customer.create({
                    cr_time: new Date().addHours(8),
                    mod_time: new Date().addHours(8),
                    fullname: dataparse.customername,
                    phone_number: customer,
                    address: dataparse.customeraddress
                })
                logger.info(newCustomer)
            }

            var newTransaction = await dbmodel.transaction.create({
                cr_time: new Date().addHours(8),
                mod_time: new Date().addHours(8),
                user: user,
                customer: customer,
                product: product,
                payment: payment,
                amount: amount,
                status: status,
                data: data,
                branch: branch,
            })
            return ({ rc: "00", rm: "success", data: newTransaction })
        } catch (error) {
            logger.error(error)
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
                mod_time: new Date().addHours(8),
                user: user,
                customer: customer,
                product: product,
                payment: payment,
                amount: amount,
                status: status
            }, { where: { id: id } })

            if(payment === 1 || payment === '1'){
                await dbmodel.transaction.update({
                    paid_date: new Date().addHours(8)
                }, { where: { id: id } })
            } else {
                await dbmodel.transaction.update({
                    paid_date: null
                }, { where: { id: id } })
            }
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
            var [transaction, meta] = await _dbmodel.query(/*sql*/`
                select
                    t.*,
                    b.name as branch_name,
                    b.address as branch_address
                from
                    \`transaction\` t
                left join branch b on
                    b.id = t.branch
            `)
            return ({ rc: "00", rm: "success", data: transaction })
        } catch (error) {
            return (error)
        }
    }

    static async getToday(req = express.request) {
        try {
            var currentdate = new Date().addHours(8).toISOString().substring(0,10);
            console.log(req.query);
            var [transaction, meta] = await _dbmodel.query(/*sql */`
                select
                    t.*,
                    b.name as branch_name,
                    b.address as branch_address 
                from \`transaction\` t 
                left join branch b on
                    b.id = t.branch
                where DATE(t.cr_time) = '${currentdate}'
                ${req.query.b ? 'and t.branch=' + req.query.b : ''}
            `)
            return ({ rc: "00", rm: "success", data: transaction })
        } catch (error) {
            return (error)
        }
    }

    static async getfiltered(req = express.request) {
        try {

            var startdate = req.body.start
            var enddate = req.body.end
            var status = req.body.status
            var payment = req.body.payment

            var query = /*sql */`
                select
                    t.*,
                    b.name as branch_name,
                    b.address as branch_address
                from
                    \`transaction\` t
                left join branch b on
                    b.id = t.branch
                where
                    DATE(cr_time) between '${startdate}' and '${enddate}'
                    ${status !== '99' ? `and t.status = ${status}` : ''}
                    ${payment !== '99' ? `and t.payment = ${payment}` : ''}
                    ${req.query.b ? 'and t.branch=' + req.query.b : ''}
            `;
            logger.info('Query: ' + query)
            var [transaction, meta] = await _dbmodel.query(query)
            return ({ rc: "00", rm: "success", data: transaction })
        } catch (error) {
            return (error)
        }
    }

    static async getAllNotDone(req = express.request) {
        try {
            var query = /*sql */`
                select
                    t.*,
                    b.name as branch_name,
                    b.address as branch_address
                from
                    \`transaction\` t
                left join branch b on
                    b.id = t.branch
                where
                   t.status <> 2
                   ${req.query.b ? 'and t.branch=' + req.query.b : ''}
            `;

            logger.info('Query: ' + query)

            var [transaction, meta] = await _dbmodel.query(query)
            return ({ rc: "00", rm: "success", data: transaction })
        } catch (error) {
            return (error)
        }
    }

    static async getundone(req = express.request) {
        try {
            var [transaction, meta] = await _dbmodel.query(/*sql */`
                select 
                    t.*,
                    b.name as branch_name,
                    b.address as branch_address
                from \`transaction\` t
                left join branch b on
                    b.id = t.branch 
                where t.status != 1
                ${req.query.b ? 'and t.branch=' + req.query.b : ''}
                `)
            return ({ rc: "00", rm: "success", data: transaction })
        } catch (error) {
            return (error)
        }
    }

    static async getReportData(req = express.request) {
        try {
            var query = /*sql */`
            select
            (
            select
                count(*)
            from
                \`transaction\` t
            where
                month(cr_time) = month(now())
                and year(cr_time) = '2021'
                and t.status = 2
                and t.payment = 1
                ${req.query.b ? 'and t.branch=' + req.query.b : ''} ) as current_count_trx,
            (
            select
                count(*)
            from
                \`transaction\` t
            where
                month(cr_time) = month(now())-1
                    and year(cr_time) = '2021'
                        and t.status = 2
                        and t.payment = 1
                        ${req.query.b ? 'and t.branch=' + req.query.b : ''} ) as previous_count_trx,
            (
            select
                sum(t.amount)
            from
                \`transaction\` t
            where
                month(cr_time) = month(now())
                    and year(cr_time) = '2021'
                        and t.status = 2
                        and t.payment = 1
                        ${req.query.b ? 'and t.branch=' + req.query.b : ''} ) as current_sum_trx,
            (
            select
                sum(t.amount)
            from
                \`transaction\` t
            where
                month(cr_time) = month(now())-1
                    and year(cr_time) = '2021'
                        and t.status = 2
                        and t.payment = 1
                        ${req.query.b ? 'and t.branch=' + req.query.b : ''}) as previous_sum_trx
        
            `
            var [transaction, meta] = await _dbmodel.query(query)
            return ({ rc: "00", rm: "success", data: transaction })
        } catch (error) {
            return (error)
        }
    }

    static async getReportSumMonthlyYear(req = express.request) {
        try {
            var [transaction, meta] = await _dbmodel.query(/*sql */`
                select
                    sum(trx.amount) as jumlah,
                    trx.timed as bulan
                from
                    (
                    select
                        t.id,
                        t.amount,
                        DATE_FORMAT(t.cr_time, '%Y-%m') as timed
                    from
                        \`transaction\` t
                    where
                        t.status = 2
                        and t.payment = 1
                        and DATE_FORMAT(t.cr_time, '%Y') = \'${new Date().getFullYear()}\'
                        ${req.query.b ? 'and t.branch=' + req.query.b : ''} ) as trx
                group by
                    trx.timed
                order by bulan asc
            `)
            return ({ rc: "00", rm: "success", data: transaction })
        } catch (error) {
            return (error)
        }
    }
    static async getReportMonthlyYear(req = express.request) {
        try {
            var year = req.body.year
            var arrayCount = []
            var [transaction, meta] = await _dbmodel.query(/*sql */`
                select
                    count(trx.timed) as jumlah,
                    trx.timed as bulan
                from
                    (
                    select
                        t.id,
                        DATE_FORMAT(t.cr_time, '%Y-%m') as timed
                    from
                        \`transaction\` t
                    where
                        t.status = 2
                        and t.payment = 1
                        and DATE_FORMAT(t.cr_time, '%Y') = \'${new Date().getFullYear()}\'
                        ${req.query.b ? 'and t.branch=' + req.query.b : ''} ) as trx
                group by
                    trx.timed
                order by bulan asc
            `)
            return ({ rc: "00", rm: "success", data: transaction })
        } catch (error) {
            return (error)
        }
    }


} exports.transactionController = transactionController