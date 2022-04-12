const fs = require('fs');
const path = require('path');
const log4js = require('log4js');
const express = require('express');
const JWT = require('jsonwebtoken');
const fileUpload = require('express-fileupload');

if (process.env.NODE_ENV != 'production') {
  require('dotenv').config();
}

const config = require('./config');

(async () => {
  await require('./db-factory').init();
  const queue = require('./utils/queue.utils');
  // const middlewares = require('./lib.middlewares');
  const functionUtils = require('./utils/faas.utils');
  

  if (!fs.existsSync('./downloads')) {
    fs.mkdirSync('./downloads');
  }

  const logger = log4js.getLogger(global.loggerName);
  global.promises = [];

  const app = express();

  app.use((req, res, next) => {
    if (req.path.split('/').indexOf('health') == -1) {
      logger.trace(req.path, req.method, req.headers);
      queue.client.publish(config.faasLastInvokedQueue, JSON.stringify({ _id: config.dataStackFaasId, startTime: (new Date()).toISOString() }));
    }
    global.activeRequest++;
    res.on('close', function () {
      global.activeRequest--;
      if (req.path.split('/').indexOf('health') === -1) {
        logger.trace(`============= REQUEST COMPLETED FOR ${req.path} =============`);
      }
    });
    next();
  });

  app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: './uploads'
  }));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.raw({ type: ['application/xml', 'text/xml'] }));
  app.use(express.json({ inflate: true, limit: '100mb' }));
  // app.use(middlewares.addHeaders);

  app.use('/api/faas', require('./routes'));

  app.use('/api/faas/utils/health/ready', async function (req, res) {
    try {
      if (global.appcenterDB) {
        return res.status(200).json({ message: 'Alive' });
      }
      return res.status(400).json({ message: 'DB Not Connected' });
    } catch (err) {
      logger.error(err);
      return res.status(500).json({ message: err.message });
    }
  });

  // Global Error Handler
  app.use(function (err, req, res, next) {
    logger.error('Handling global error - ', err.stack);

    let errorData = functionUtils.getErrorResponse(err, 500);

    logger.error('Global error - ', errorData);

    res.status(500).json(errorData)
  });

  const server = app.listen(config.port, function (err) {
    if (err) {
      logger.error(err);
    } else {
      logger.info('Server Listening on port:', config.port);
      functionUtils.informBM();
      functionUtils.initBM();
    }
  });

  // Server Timeout for 2 hr
  server.setTimeout(7200000);

  process.on('SIGTERM', () => {
    try {
      // Handle Request for 15 sec then stop recieving
      setTimeout(() => {
        global.stopServer = true;
      }, 15000);
      logger.info('Process Kill Request Recieved');
      const intVal = setInterval(() => {
        // Waiting For all pending requests to finish;
        if (global.activeRequest === 0) {
          // Closing Express Server;
          server.close(() => {
            logger.info('Server Stopped.');
          });
          clearInterval(intVal);
        } else {
          logger.info('Waiting for request to complete, Active Requests:', global.activeRequest);
        }
      }, 2000);
    } catch (e) {
      logger.error(e);
      throw e;
    }
  });
})();
