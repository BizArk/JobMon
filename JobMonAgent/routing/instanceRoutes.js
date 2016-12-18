var express = require('express');
//var routingUtil = require('./routingUtil.js');
var debug = require('debug')('jobmon.route.instance')

function instanceRoutes(jmdb) {

    function startInstance(req, res) {
        var instance = req.data;
        instance.started = Date.now();
        instance.save(routingUtil.saveResponse(res, 200, instance));
    }

    var router = express.Router();

    router.route('/:instanceID/start')
        .put(startInstance);

    return router;
}

module.exports = instanceRoutes;