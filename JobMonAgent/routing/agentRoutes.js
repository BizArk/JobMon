var express = require('express');
var debug = require('debug')('jobmon.route.agent')
var os = require('os');

var cfg = require('../config.js');

function agentRoutes(jmdb) {

    function getInfo(req, res) {
        return res.status(200).json({ 
            name: cfg.name,
            hostname: os.hostname(),
            pid: process.pid,
            arch: process.arch,
            platform: os.platform(),
            os_type: os.type(),
            release: os.release(),
            freemem: os.freemem(),
            totalmem: os.totalmem()
         })
    }

    var router = express.Router();

    router.route('/')
        .get(getInfo);

    return router;
}

module.exports = agentRoutes;