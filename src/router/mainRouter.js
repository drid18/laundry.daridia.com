const express = require('express')
const { branchController } = require('../controller/branchController')
const { customerController } = require('../controller/customerController')
const { mainController } = require('../controller/mainController')
const { productController } = require('../controller/productController')
const { reportController } = require('../controller/reportController')
const { sessionController } = require('../controller/sessionController')
const { transactionController } = require('../controller/transactionController')
const { userController } = require('../controller/userController')
const { configController } = require('../controller/configController')
const { dbmodel } = require('../model/db')
const { log4js } = require('../utility/logger')
const logger = log4js.getLogger(require('path').basename(__filename, '.js'))

class mainRouter {
    static async init(app = express()) {
        logger.info("--> initials mainRouter")
        app.post('/service*', async function (req = express.request) {
            logger.info("request: " + req.path + " POST")
            logger.info("query: " + JSON.stringify(req.query))
            logger.info("body : " + JSON.stringify(req.body))
            var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            var activity_user = null
            if (req.session.userid) activity_user = req.session.userid
            var activity = await dbmodel.activity.create({
                path: req.path,
                ip: ip,
                req_time: new Date(),
                req_body: JSON.stringify(req.body),
                info: activity_user
            })
            await activity.save()

            var response = { rc: "99", rm: "somethings went wrong :(" }
            switch (req.path) {
                case '/service/test': response = await mainController.servertest(req); break;
                case '/service/user/registration': response = await userController.registerUser(req); break;
                case '/service/user/update': response = await userController.updateUser(req); break;
                case '/service/user/updatepass': response = await userController.updatePassword(req); break;
                case '/service/user/delete': response = await userController.deleteUser(req); break;
                case '/service/user/setstatus': response = await userController.setStatus(req); break;
                case '/service/user/setconfig': response = await userController.setUserConfig(req); break;
                case '/service/user/getconfig': response = await userController.getUserConfig(req); break;
                case '/service/user': response = await userController.getall(req); break;

                case '/service/user/login': response = await sessionController.login(req); break;
                case '/service/user/logout': response = await sessionController.logout(req); break;
                case '/service/user/checksession': response = await sessionController.checksession(req); break;

                case '/service/product/add': response = await productController.addProduct(req); break;
                case '/service/product/update': response = await productController.updateProduct(req); break;
                case '/service/product/delete': response = await productController.deleteProduct(req); break;
                case '/service/product': response = await productController.getall(req); break; 
                
                case '/service/branch/add': response = await branchController.addBranch(req); break;
                case '/service/branch/update': response = await branchController.updateBranch(req); break;
                case '/service/branch/delete': response = await branchController.deleteBranch(req); break;
                case '/service/branch': response = await branchController.getall(req); break; 
                case '/service/branch/id': response = await branchController.getbyid(req); break; 

                case '/service/customer': response = await customerController.getAll(req); break; 
                case '/service/customer/add': response = await customerController.addCustomer(req); break; 
                case '/service/customer/update': response = await customerController.updateCustomer(req); break; 
                case '/service/customer/delete': response = await customerController.deleteCustomer(req); break; 
                case '/service/customer/find/phone': response = await customerController.findbyphone(req); break; 
                case '/service/customer/find/name': response = await customerController.findbyname(req); break;
                case '/service/customer/find/input': response = await customerController.findbynumberorname(req); break;

                case '/service/transaction': response = await transactionController.getAll(req); break; 
                case '/service/transaction/today': response = await transactionController.getToday(req); break; 
                case '/service/transaction/filtered': response = await transactionController.getfiltered(req); break; 
                case '/service/transaction/incomplete': response = await transactionController.getAllNotDone(req); break; 
                case '/service/transaction/add': response = await transactionController.addTransaction(req); break; 
                case '/service/transaction/update': response = await transactionController.editTransaction(req); break; 
                case '/service/transaction/delete': response = await transactionController.deleteTransaction(req); break; 
                case '/service/transaction/process': response = await transactionController.getundone(req); break; 
                case '/service/transaction/report/data': response = await transactionController.getReportData(req); break;
                case '/service/transaction/report/sum/monthlyyear': response = await transactionController.getReportSumMonthlyYear(req); break;
                case '/service/transaction/report/count/monthlyyear': response = await transactionController.getReportMonthlyYear(req); break; 
                
                case '/service/report/customer/transaction': response = await reportController.getCustomerTransactionPerMonth(req); break; 
                case '/service/report/transaction/bytrx': response = await reportController.getTransactionByTrxDate(req); break; 
                case '/service/report/transaction/bypaid': response = await reportController.getTransactionByPaidDate(req); break; 
                
                case '/service/config/getall': response = await configController.getDefaultConfig(req); break; 
                case '/service/config/setall': response = await configController.setConfig(req); break; 
                
                default: response = { rc: 99, rm: "path not found" }; break;
            }
            activity.res_time = new Date()
            activity.res_body = JSON.stringify(response).length < 1000 ? JSON.stringify(response) : "response too long..."
            await activity.save()
            req.res.send(response)
        })
    }
} exports.mainRouter = mainRouter