const router = require('express').Router();


router.use('/post', require('./faas.router'));


module.exports = router;
