const express = require('express')
const { log4js } = require('../utility/logger')
const { dbmodel, _dbmodel } = require('../model/db')
const logger = log4js.getLogger(require('path').basename(__filename, '.js'))
const axios = require("axios").default;
const { cs } = require('../utility/constants');

class transactionController {
    static async addTransaction(req = express.request) {
        try {

            logger.info('add new transaction')

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
                    cr_time: new Date(),
                    mod_time: new Date(),
                    fullname: dataparse.customername,
                    phone_number: customer,
                    address: dataparse.customeraddress
                })
                logger.info(newCustomer)
            }

            var newTransaction = await dbmodel.transaction.create({
                cr_time: new Date(),
                mod_time: new Date(),
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
            var [transaction, meta] = await _dbmodel.query(/*sql */`
                select
                    t.*,
                    b.name as branch_name,
                    b.address as branch_address 
                from \`transaction\` t 
                left join branch b on
                    b.id = t.branch
                where DATE(t.cr_time) = CURDATE()
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
                where t.status != 1`)
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
                and t.payment = 1) as current_count_trx,
            (
            select
                count(*)
            from
                \`transaction\` t
            where
                month(cr_time) = month(now())-1
                    and year(cr_time) = '2021'
                        and t.status = 2
                        and t.payment = 1) as previous_count_trx,
            (
            select
                sum(t.amount)
            from
                \`transaction\` t
            where
                month(cr_time) = month(now())
                    and year(cr_time) = '2021'
                        and t.status = 2
                        and t.payment = 1) as current_sum_trx,
            (
            select
                sum(t.amount)
            from
                \`transaction\` t
            where
                month(cr_time) = month(now())-1
                    and year(cr_time) = '2021'
                        and t.status = 2
                        and t.payment = 1) as previous_sum_trx
        
            `
            var [transaction, meta] = await _dbmodel.query(query)
            return ({ rc: "00", rm: "success", data: transaction })
        } catch (error) {
            return (error)
        }
    }

    static async getReportSumMonthlyYear(req = express.request) {
        try {
            var year = req.body.year
            var arrayCount = []
            var [transaction, meta] = await _dbmodel.query(/*sql */`
                select (select sum(t.amount) as count from \`transaction\` t where month(cr_time) = 1 and year(cr_time) = ${year} and t.status = 2 and t.payment = 1) as jumlah,'januari' as bulan
                union select (select sum(t.amount) as count from \`transaction\` t where month(cr_time) = 2 and year(cr_time) = ${year} and t.status = 2 and t.payment = 1) as jumlah,'februari' as bulan
                union select (select sum(t.amount) as count from \`transaction\` t where month(cr_time) = 3 and year(cr_time) = ${year} and t.status = 2 and t.payment = 1) as jumlah,'maret' as bulan
                union select (select sum(t.amount) as count from \`transaction\` t where month(cr_time) = 4 and year(cr_time) = ${year} and t.status = 2 and t.payment = 1) as jumlah,'april' as bulan
                union select (select sum(t.amount) as count from \`transaction\` t where month(cr_time) = 5 and year(cr_time) = ${year} and t.status = 2 and t.payment = 1) as jumlah,'mei' as bulan
                union select (select sum(t.amount) as count from \`transaction\` t where month(cr_time) = 6 and year(cr_time) = ${year} and t.status = 2 and t.payment = 1) as jumlah,'juni' as bulan
                union select (select sum(t.amount) as count from \`transaction\` t where month(cr_time) = 7 and year(cr_time) = ${year} and t.status = 2 and t.payment = 1) as jumlah,'juli' as bulan
                union select (select sum(t.amount) as count from \`transaction\` t where month(cr_time) = 8 and year(cr_time) = ${year} and t.status = 2 and t.payment = 1) as jumlah,'agustus' as bulan
                union select (select sum(t.amount) as count from \`transaction\` t where month(cr_time) = 9 and year(cr_time) = ${year} and t.status = 2 and t.payment = 1) as jumlah,'september' as bulan
                union select (select sum(t.amount) as count from \`transaction\` t where month(cr_time) = 10 and year(cr_time) = ${year} and t.status = 2 and t.payment = 1) as jumlah,'oktober' as bulan
                union select (select sum(t.amount) as count from \`transaction\` t where month(cr_time) = 11 and year(cr_time) = ${year} and t.status = 2 and t.payment = 1) as jumlah,'november' as bulan
                union select (select sum(t.amount) as count from \`transaction\` t where month(cr_time) = 12 and year(cr_time) = ${year} and t.status = 2 and t.payment = 1) as jumlah,'desember' as bulan
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
                select (select count(*) as count from \`transaction\` t where month(cr_time) = 1 and year(cr_time) = ${year} and t.status = 2 and t.payment = 1) as jumlah,'januari' as bulan
                union select (select count(*) as count from \`transaction\` t where month(cr_time) = 2 and year(cr_time) = ${year} and t.status = 2 and t.payment = 1) as jumlah,'februari' as bulan
                union select (select count(*) as count from \`transaction\` t where month(cr_time) = 3 and year(cr_time) = ${year} and t.status = 2 and t.payment = 1) as jumlah,'maret' as bulan
                union select (select count(*) as count from \`transaction\` t where month(cr_time) = 4 and year(cr_time) = ${year} and t.status = 2 and t.payment = 1) as jumlah,'april' as bulan
                union select (select count(*) as count from \`transaction\` t where month(cr_time) = 5 and year(cr_time) = ${year} and t.status = 2 and t.payment = 1) as jumlah,'mei' as bulan
                union select (select count(*) as count from \`transaction\` t where month(cr_time) = 6 and year(cr_time) = ${year} and t.status = 2 and t.payment = 1) as jumlah,'juni' as bulan
                union select (select count(*) as count from \`transaction\` t where month(cr_time) = 7 and year(cr_time) = ${year} and t.status = 2 and t.payment = 1) as jumlah,'juli' as bulan
                union select (select count(*) as count from \`transaction\` t where month(cr_time) = 8 and year(cr_time) = ${year} and t.status = 2 and t.payment = 1) as jumlah,'agustus' as bulan
                union select (select count(*) as count from \`transaction\` t where month(cr_time) = 9 and year(cr_time) = ${year} and t.status = 2 and t.payment = 1) as jumlah,'september' as bulan
                union select (select count(*) as count from \`transaction\` t where month(cr_time) = 10 and year(cr_time) = ${year} and t.status = 2 and t.payment = 1) as jumlah,'oktober' as bulan
                union select (select count(*) as count from \`transaction\` t where month(cr_time) = 11 and year(cr_time) = ${year} and t.status = 2 and t.payment = 1) as jumlah,'november' as bulan
                union select (select count(*) as count from \`transaction\` t where month(cr_time) = 12 and year(cr_time) = ${year} and t.status = 2 and t.payment = 1) as jumlah,'desember' as bulan
            `)
            return ({ rc: "00", rm: "success", data: transaction })
        } catch (error) {
            return (error)
        }
    }


} exports.transactionController = transactionController