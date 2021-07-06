const envConfig = require('../config');
const { client } = require('./queue.utils');

function configure(config, layouts) {
    return function (loggingEvent) {
        client.publish(envConfig.consoleLogQueueName, JSON.stringify(loggingEvent));
    };
}

exports.configure = configure;