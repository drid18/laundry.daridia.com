const express = require('express')
const { mainRouter } = require('./src/router/mainRouter')
const { log4js } = require('./src/utility/logger')
const app = express()
const port = 3000
const logger = log4js.getLogger(require('path').basename(__filename, '.js'))

logger.info("--> Starting node")

app.use(express.static('public'))

mainRouter.init(app)

app.listen(port, () => {
    logger.info(`app listening at http://localhost:${port}`)
})

module.exports = app //for local test unit