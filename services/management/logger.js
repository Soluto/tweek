const winston = require('winston');
// const LogzIO = require('winston-logzio');

const logger = new winston.Logger({
  exitOnError: false,
});

logger.add(winston.transports.Console);
/*
logger.add(LogzIO, {
    token: 'wsEabfWJZpXkwVqUVrVNvhSvUnnYtzbg',
    type: 'tweek-management'
});*/

process.on('uncaughtException', err => {
    logger.error(err);
});

module.exports = logger;
