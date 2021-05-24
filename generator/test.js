const inquirer = require('inquirer');
const log4js = require('log4js');

const logger = log4js.getLogger('Test Generator');
logger.level = 'debug';
global.logger = logger;

const generator = require('./index');


inquirer.prompt([
  {
    name: 'flowType',
    type: 'list',
    choices: [
      'API-API',
      'API-FILE',
      'FILE-API',
      'FILE-FILE',
      'API-NS-NS-API',
      'BIN-BIN',
      'SHAPOORJI',
      'EssarFlow'
    ]
  }
]).then(answer => {
  const flowJSON = require(`./${answer.flowType}.json`);
  generator.createProject(flowJSON);
}).catch(console.error);


