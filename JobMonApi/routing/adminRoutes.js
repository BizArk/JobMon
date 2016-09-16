var express = require('express');
var routingUtil = require('./routingUtil.js');
var mongoose = require('mongoose');
var debug = require('debug')('jobmon.route.admin')

function adminRoutes(jmdb) {

    function clearDB(req, res) {
        var fns = [
            jmdb.Install.remove().exec(),
            jmdb.Instance.remove().exec(),
            jmdb.Agent.remove().exec(),
            jmdb.Job.remove().exec()
        ]

        Promise.all(fns)
            .then(function() {
                debug('Cleared the database');
                return res.status(204).send('The database has been cleared.');
            })
            .catch(function(err) {
                debug('Unable to clear the database.');
                return res.status(500).send(err);
            });
    }

    var router = express.Router();

    router.route('/db').delete(clearDB);

    return router;
}

module.exports = adminRoutes;
