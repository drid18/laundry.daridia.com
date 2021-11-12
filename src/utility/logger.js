const log4js = require('log4js');

log4js.configure({
    appenders: {
        everything: {
            type: 'dateFile', filename: 'logs/debug.log', layout: {
                type: 'pattern',
                pattern: '%d %p %c %n%m%n'
            }
        },
        out: {
            type: 'stdout', layout: {
                type: 'pattern',
                pattern: '%[%d %p %c %] %n%m%n'
            }
        }
    },
    categories: {
        default: { appenders: ['everything', 'out'], level: 'debug', enableCallStack: true }
        // default: { appenders: ['everything'], level: 'debug', enableCallStack: true }
    },

});

exports.log4js = log4js