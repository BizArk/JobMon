var express = require('express');
var routingUtil = require('./routingUtil.js');
var mongoose = require('mongoose');
var debug = require('debug')('jobmon.route.admin')

function adminRoutes(jmdb) {

    function clearDB(req, res) {
        mongoose.connection.db.dropDatabase();
        return res.status(204).json({ message: 'The database has been dropped.' })
    }

    var router = express.Router();

    router.route('/db').delete(clearDB);

    return router;
}

module.exports = adminRoutes;
