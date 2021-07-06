const envConfig = require('../config');
const { client } = require('./queue.utils');

const logger = global.logger;

function configure(config, layouts) {
    return function (loggingEvent) {
        try {
            client.publish(envConfig.consoleLogQueueName, JSON.stringify(loggingEvent));
            logger.debug('Logs Published to Queue');
        } catch (err) {
            logger.console.error('Error Publishing Logs', err);
        }
    };
}

exports.configure = configure;