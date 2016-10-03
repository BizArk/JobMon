var express = require('express');
var routingUtil = require('./routingUtil.js');
var debug = require('debug')('jobmon.route.message')

function messageRoutes(jmdb) {

    function getMessages(req, res) {
        routingUtil.queryData(req, jmdb.Message, function(response) {
            res.status(200).json(response);
        });
    }

    var router = express.Router();

    router.route('/')
        .get(getMessages);

    return router;
}

module.exports = messageRoutes;
