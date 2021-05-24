const router = require('express').Router();


router.use('/post', require('./faas.router'));
router.use('/utils', require('./utils.router'));


module.exports = router;
