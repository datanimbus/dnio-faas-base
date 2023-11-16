const got = require('got');
const config = require('../config');
const log4js = require('log4js');

const logger = log4js.getLogger();


function getErrorResponse(err, code) {
  let errResp = {};
  errResp.appName = config.app;
  errResp.faasId = config.faasId;
  errResp.faasName = config.faasName;
  errResp.message = JSON.stringify(err.message || err);
  errResp.stackTrace = JSON.stringify(err.stack || err);
  errResp.statusCode = JSON.stringify(code)
  return errResp;
}


function informBM() {
  const url = config.baseUrlBM + `/${config.app}/faas/utils/${config.faasId}/statusChange?status=Active&version=${config.faasVersion}`;
  logger.debug('Informing BM :', url);
  request({
    url,
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    }
  }, function (err, res) {
    if (err) {
      logger.error('Unable to Inform BM', err);
      return;
    }
    if (res.statusCode >= 300 || res.statusCode < 200) {
      logger.error('Response from BM:', res.statusCode, res.body);
    } else {
      logger.info('Informed BM');
    }
  });
}

function initBM() {
  const url = config.baseUrlBM + `/${config.app}/faas/utils/${config.faasId}/init`;
  logger.debug('Initializing with BM :', url);
  request({
    url,
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    }
  }, function (err, res) {
    if (err) {
      logger.error('Unable to Inform BM', err);
      return;
    }
    if (res.statusCode >= 300 || res.statusCode < 200) {
      logger.error('Response from BM:', res.statusCode, res.body);
    } else {
      logger.info('Initialized with BM');
    }
  });
}

function getGOTOptions(options) {
  let gotOptions = {};
  gotOptions.throwHttpErrors = false;
  gotOptions.url = options.url;
  gotOptions.method = options.method;
  gotOptions.headers = options.headers;
  if (options.json) {
    gotOptions.responseType = 'json';
  }
  if (options.body) {
    gotOptions.json = options.body;
  }
  if (options.qs) {
    gotOptions.searchParams = options.qs;
  }
  return gotOptions;
}

function request(options, callback) {
  const gotOptions = getGOTOptions(options);
  got(gotOptions).then((res) => {
    if (res) {
      callback(null, res, res.body);
    } else {
      callback(null, null, null);
    }
  }).catch(err => {
    handleError(err, callback);
  });
}

function handleError(err, callback) {
	let error = {};
	error.code = err.code;
	error.name = err.name;
	error.message = err.message;
	error.stack = err.stack;
	if (error.code == 'ECONNREFUSED') {
		callback(null, null, null);
	} else {
		callback(error, null, null);
	}
}

module.exports = {
  getErrorResponse,
  informBM,
  initBM
};
