var express = require('express');
//var routingUtil = require('./routingUtil.js');
var debug = require('debug')('jobmon.route.instance')

function instanceRoutes(jmdb) {

    function startInstance(req, res) {
        var instance = req.data;

        res.status(200).json(instance);
    }

    var router = express.Router();

    router.route('/:instanceID/start')
        .put(startInstance);

    return router;
}

module.exports = instanceRoutes;