var express = require('express');
var router = express.Router();

const fxn = require('../controllers')

/* GET home page. */
router.get('/', function(req, res) {
  res.send(req.query)
});

router.get('/agencies', fxn.getAgencies)

router.get('/timezone', fxn.getTZ)

router.get('/routes', fxn.getRoutes)

router.get('/origins', fxn.getOrigins)

router.get('/dests', fxn.getDests)

router.get('/timetable', fxn.getTT)

module.exports = router;
