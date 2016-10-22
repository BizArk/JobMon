var express = require('express');
var routingUtil = require('./routingUtil.js');
var debug = require('debug')('jobmon.route.install')

function installRoutes(jmdb) {

    function createInstall(req, res) {
        var install = new jmdb.Install(req.body);

        // We cannot install a job if it does not have an install file associated with it.
        jmdb.Job.findById(install.job, function (err, job) {
            if (err) {
                err = toStandardErr(err);
                res.status(400).json(err);
                return;
            }

            if (job && !job.fileHash) {
                var err = {
                    name: 'InvalidJob',
                    message: 'Job does not have an install file.'
                };
                res.status(400).json(err);
                return;
            }

            install.save(routingUtil.saveResponse(res, 201, install));
        });

    }

    function deleteInstall(req, res) {
        var install = req.data;
        jmdb.Install.remove(routingUtil.saveResponse(res, 204));
    }

    function getInstall(req, res) {
        return res.status(200).json(req.data);
    }

    function getInstalls(req, res) {
        routingUtil.queryData(req, jmdb.Install, function (response) {
            var installs = response.data;
            var returnedInstalls = [];
            installs.forEach(function (install) {
                var retInstall = install.toJSON();
                retInstall.links = {
                    self: `http://${req.headers.host}/api/installs/${retInstall._id}`
                };
                returnedInstalls.push(retInstall);
            });
            response.data = returnedInstalls;
            res.status(200).json(response);
        });
    }

    function patchInstall(req, res) {
        var install = req.data;
        for (var key in req.body) {
            switch (key) {
                case 'fileHash': // These are the only fields that can be changed.
                case 'uninstall':
                    install[key] = req.body[key];
                    break;
            }
        }
        install.save(routingUtil.saveResponse(res, 200, install));
    }

    var router = express.Router();

    router.use('/:installID', routingUtil.findDocByID(jmdb.Install, 'installID', 'Unable to find install.'));

    router.route('/')
        .get(getInstalls)
        .post(createInstall);

    router.route('/:installID')
        .delete(deleteInstall)
        .get(getInstall)
        .patch(patchInstall);

    return router;
}

module.exports = installRoutes;