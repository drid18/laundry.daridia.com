const express = require('express')
const session = require('express-session')
const { mainRouter } = require('./src/router/mainRouter')
const { log4js } = require('./src/utility/logger')
const app = express()
const port = 3000
const logger = log4js.getLogger(require('path').basename(__filename, '.js'))

Date.prototype.addHours = function (h) {
    this.setTime(this.getTime() + (h * 60 * 60 * 1000));
    return this;
}

logger.info("--> Starting node")

app.use(express.json())

app.use(session({ secret: 'laundryapp', cookie: { maxAge: 60000 * 24 * 30} }))

// app.use('/', function (req, res) {
//     res.redirect('/login')
// })

app.use('/dashboard', function (req, res, next) {
    if (req.session.userid) {
        next()
    } else {
        res.redirect('/login')
    }
})

app.use(express.static('public'))

mainRouter.init(app)

app.listen(port, () => {
    logger.info(`app listening at http://localhost:${port}`)
})

module.exports = app //for local test unit