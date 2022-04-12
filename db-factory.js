const fs = require('fs');
const log4js = require('log4js');
const mongoose = require('mongoose');

const config = require('./config');

let logger = log4js.getLogger(global.loggerName);

async function establishingAppCenterDBConnections() {
	try {
		logger.info(`Appcenter DB : ${config.mongoAppCenterOptions.dbName}`);
		await mongoose.connect(config.mongoUrl, config.mongoAppCenterOptions);
		logger.info(`Connected to appcenter db : ${config.faasDB}`);
		mongoose.connection.on('connecting', () => { logger.info(` *** ${config.faasDB} CONNECTING *** `); });
		mongoose.connection.on('disconnected', () => { logger.error(` *** ${config.faasDB} LOST CONNECTION *** `); });
		mongoose.connection.on('reconnect', () => { logger.info(` *** ${config.faasDB} RECONNECTED *** `); });
		mongoose.connection.on('connected', () => { logger.info(`Connected to ${config.faasDB} DB`); });
		mongoose.connection.on('reconnectFailed', () => { logger.error(` *** ${config.faasDB} FAILED TO RECONNECT *** `); });

		global.gfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: `${config.faasCollection}` });
		global.gfsBucketExport = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: `${config.faasCollection}.exportedFile` });
		global.gfsBucketImport = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: `${config.faasCollection}.fileImport` });
		await setIsTransactionAllowed();
	} catch (e) {
		logger.error(e.message);
	}
}

async function establishAuthorAndLogsDBConnections() {
	let promises = [];
	logger.info(`Author DB :: ${config.mongoAuthorOptions.dbName}`);
	const authorDB = mongoose.createConnection(config.mongoAuthorUrl, config.mongoAuthorOptions);
	authorDB.on('connecting', () => { logger.info(` *** ${config.authorDB} CONNECTING *** `); });
	authorDB.on('disconnected', () => { logger.error(` *** ${config.authorDB} LOST CONNECTION *** `); });
	authorDB.on('reconnect', () => { logger.info(` *** ${config.authorDB} RECONNECTED *** `); });
	authorDB.on('connected', () => {
		logger.info(`Connected to author db : ${config.authorDB}`);
		promises.push(Promise.resolve('Connected to AuthorDB'));
	});
	authorDB.on('reconnectFailed', () => { logger.error(` *** ${config.authorDB} FAILED TO RECONNECT *** `); });
	global.authorDB = authorDB;

	logger.debug(`Logs DB :: ${config.mongoLogsOptions.dbName}`);
	const logsDB = mongoose.createConnection(config.mongoLogUrl, config.mongoLogsOptions);
	logsDB.on('connecting', () => { logger.info(` *** ${config.logsDB} CONNECTING *** `); });
	logsDB.on('disconnected', () => { logger.error(` *** ${config.logsDB} LOST CONNECTION *** `); });
	logsDB.on('reconnect', () => { logger.info(` *** ${config.logsDB} RECONNECTED *** `); });
	logsDB.on('connected', () => {
		logger.info(`Connected to logs db : ${config.logsDB}`);
		promises.push(Promise.resolve('Connected to LogsDB'));
	});
	logsDB.on('reconnectFailed', () => { logger.error(` *** ${config.logsDB} FAILED TO RECONNECT *** `); });
	global.logsDB = logsDB;

	await Promise.all(promises);
}

async function fetchFunctionDetails(faasID) {
	try {
		logger.info(`Fetching functions details : ${faasID}`);
		return await global.authorDB.collection('b2b.faas').findOne({ _id: faasID });
	} catch (e) {
		logger.error(`Unable to fetch function details :: ${faasID}`);
		logger.error(e.message);
	}
}

function initConfigVariables(faasDoc) {
	config.app = faasDoc.app;
	config.faasName = faasDoc.name;
	config.faasPort = faasDoc.port;//
	config.faasVersion = faasDoc.version;
	config.faasDB = `${config.namespace}-${faasDoc.app}`;
	config.faasEndpoint = faasDoc.url;
	config.faasCollection = faasDoc.collectionName;//

	config.mongoAppCenterOptions.dbName = config.faasDB;

	logger.info(`Faas ID : ${config.faasId}`);
	logger.info(`Faas version : ${config.faasVersion}`);
}

async function init() {
	try {
		await establishAuthorAndLogsDBConnections();
		let faasDoc = await fetchFunctionDetails(config.faasId);
		logger.info(`Faas document : ${JSON.stringify(faasDoc)}`);
		// INIT CONFIG based on the faas doc
		initConfigVariables(faasDoc);
		// GENERATE THE CODE
		require('./generator').createProject(faasDoc);
		// CONNECT TO APPCENTER DB
		await establishingAppCenterDBConnections();
	} catch (e) {
		logger.error('Error in DB init!');
		logger.error(e);
		process.exit();
	}
}

module.exports.init = init;
