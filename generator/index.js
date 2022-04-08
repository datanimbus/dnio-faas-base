const fs = require('fs');
const path = require('path');
const log4js = require('log4js');

const { getFaasContent } = require('./faas.generator');

const logger = log4js.getLogger(global.loggerName);


async function createProject(functionJSON, txnId) {
  try {
    if (!functionJSON.port) {
      functionJSON.port = 31000;
    }
    const folderPath = process.cwd(); 
    logger.info(`[${txnId}] Creating Project Folder - ${folderPath}`);

    let faasContent = await getFaasContent(functionJSON);
    fs.writeFileSync(path.join(folderPath, 'routes', `faas.router.js`), faasContent, "utf-8");
    
    fs.writeFileSync(path.join(folderPath, 'faas.json'), JSON.stringify(functionJSON));

    logger.info(`[${txnId}] Project Folder Created! ${folderPath}`);
  } catch (e) {
    logger.error(`[${txnId}] Project Folder Error! ${e}`);
  }
}

module.exports.createProject = createProject;
