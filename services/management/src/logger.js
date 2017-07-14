const winston = require('winston');

const logger = new winston.Logger({
  exitOnError: false,
});

logger.add(winston.transports.Console);

process.on('uncaughtException', (err) => {
  logger.error(err);
});

module.exports = logger;
