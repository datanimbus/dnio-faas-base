const log4js = require('log4js');
const logger = log4js.getLogger('request.generator');


async function getFaasContent(functionData) {

	let content = `
		const lodash = require('lodash');
		const faker = require("faker");
		const uuid = require('uuid');
		const validator = require('validator');
		const moment = require('moment');
		const got = require('got');
		const SDK = require('@appveen/ds-sdk');

		const router = require('express').Router();
		
		if (process.env.NODE_ENV != 'production') {
			require('dotenv').config();
		}

		const {fqdn, logLevel, dataStackNS, dataStackAppName, dataStackAllowedFileType} = require('../config');
		const faasData = require('../faas.json');

		const FQDN = fqdn;
		const LOG_LEVEL = logLevel;
		const DATA_STACK_NAMESPACE = dataStackNS;
		const DATA_STACK_APP_NAMESPACE = dataStackAppName;
		const DATA_STACK_ALLOWED_FILE_TYPE = dataStackAllowedFileType;

		let logger = global.logger;

		router.use(customLogger);

  		router.use(async (req, res, next) => {

   	  		logger.info(\`Starting to Process Faas -> Data-Stack-Txn-Id - \${req.header('data-stack-txn-id')} | Data-Stack-Remote-Txn-Id - \${req.header('data-stack-remote-txn-id')} \`);

   			req['local'] = {};
			req['local']['data-stack-txn-id'] = req.header('data-stack-txn-id');
			req['local']['data-stack-remote-txn-id'] = req.header('data-stack-remote-txn-id');
			req['local']['data-stack-deployment-name'] = req.header('data-stack-deployment-name');

			req['local']['headers'] = [];

			// Deny new requests, if process kill request was recieved
			if (global.stopServer) {
				return res.status(400).json({ message: 'Server has stopped accepting requests' });
			}

			if (Buffer.isBuffer(req.body)) {
				req.body = req.body.toString();
			}
			next();
		});

		${functionData.code}
		
		function customLogger(req, res, next) {
			if (req.header('data-stack-txn-id')) {
				logger = log4js.getLogger(\`\${global.loggerName} [\${req.header('data-stack-txn-id')}] [\${req.header('data-stack-remote-txn-id')}]\`);
			}
			next();
		};

		module.exports = router;
	`;
	return { content };
}


module.exports = {
	getFaasContent
};
