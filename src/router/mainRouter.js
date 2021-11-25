const express = require('express')
const { customerController } = require('../controller/customerController')
const { mainController } = require('../controller/mainController')
const { productController } = require('../controller/productController')
const { sessionController } = require('../controller/sessionController')
const { transactionController } = require('../controller/transactionController')
const { userController } = require('../controller/userController')
const { dbmodel } = require('../model/db')
const { log4js } = require('../utility/logger')
const logger = log4js.getLogger(require('path').basename(__filename, '.js'))

class mainRouter {
    static async init(app = express()) {
        logger.info("--> initials mainRouter")
        app.post('/service*', async function (req = express.request) {
            logger.info("request: " + req.path + " POST")
            logger.info("body: " + JSON.stringify(req.body))
            var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            var activity = await dbmodel.activity.create({
                path: req.path,
                ip: ip,
                req_time: new Date(),
                req_body: JSON.stringify(req.query)
            })
            await activity.save()

            var response = { rc: "99", rm: "somethings went wrong :(" }
            switch (req.path) {
                case '/service/test': response = await mainController.servertest(req); break;
                case '/service/user/registration': response = await userController.registerUser(req); break;
                case '/service/user/update': response = await userController.updateUser(req); break;
                case '/service/user/delete': response = await userController.deleteUser(req); break;
                case '/service/user/setstatus': response = await userController.setStatus(req); break;

                case '/service/user/login': response = await sessionController.login(req); break;
                case '/service/user/logout': response = await sessionController.logout(req); break;
                case '/service/user/checksession': response = await sessionController.checksession(req); break;

                case '/service/product/add': response = await productController.addProduct(req); break;
                case '/service/product/update': response = await productController.updateProduct(req); break;
                case '/service/product/delete': response = await productController.deleteProduct(req); break;
                case '/service/product': response = await productController.getall(req); break; 

                case '/service/customer': response = await customerController.getAll(req); break; 
                case '/service/customer/add': response = await customerController.addCustomer(req); break; 
                case '/service/customer/update': response = await customerController.updateCustomer(req); break; 
                case '/service/customer/delete': response = await customerController.deleteCustomer(req); break; 
                case '/service/customer/find/phone': response = await customerController.findbyphone(req); break; 
                case '/service/customer/find/name': response = await customerController.findbyname(req); break;

                case '/service/transaction': response = await transactionController.getAll(req); break; 
                case '/service/transaction/add': response = await transactionController.addTransaction(req); break; 
                case '/service/transaction/update': response = await transactionController.editTransaction(req); break; 
                case '/service/transaction/delete': response = await transactionController.deleteTransaction(req); break; 
                case '/service/transaction/today': response = await transactionController.gettoday(req); break; 
                case '/service/transaction/process': response = await transactionController.getundone(req); break; 
                
                default: response = { rc: 99, rm: "path not found" }; break;
            }
            activity.res_time = new Date()
            activity.res_body = JSON.stringify(response).length < 1000 ? JSON.stringify(response) : "response too long..."
            await activity.save()
            req.res.send(response)
        })
    }
} exports.mainRouter = mainRouter