const request = require('request');
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


module.exports = {
  getErrorResponse,
  informBM,
  initBM
};
