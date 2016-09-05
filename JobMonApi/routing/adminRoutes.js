var express = require('express');
var routingUtil = require('./routingUtil.js');
var mongoose = require('mongoose');

function adminRoutes(jmdb) {

    function clearDB(req, res) {
        var pagent = jmdb.Agent.remove().exec();
        var pinstance = jmdb.Instance.remove().exec();
        var pjob = jmdb.Job.remove().exec();

        Promise.all([pjob, pagent, pinstance])
            .then(function() {
                console.log('Cleared the database');
                return res.status(204).send('The database has been cleared.');
            })
            .catch(function(err) {
                console.log('Unable to clear the database.');
                return res.status(500).send(err);
            });
    }

    var router = express.Router();

    router.route('/db').delete(clearDB);

    return router;
}

module.exports = adminRoutes;
