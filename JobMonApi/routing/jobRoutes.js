var express = require('express');
var routingUtil = require('./routingUtil.js');

function jobRoutes(jmdb) {

    function deleteJob(req, res) {
        var job = req.data;
        job.remove(routingUtil.saveResponse(res, 204));
    }

    function getJob(req, res) {
        return res.status(200).json(req.data);
    }

    function getJobs(req, res) {
        jmdb.Job.find(function (err, jobs) {
            if (err) {
                err = routingUtil.toStandardErr(err);
                res.status(400).json(err);
            } else {
                var returnedJobs = [];
                jobs.forEach(function (job) {
                    var retJob = job.toJSON();
                    retJob.links = {
                        self: `http://${req.headers.host}/api/jobs/${retJob._id}`
                    };
                    returnedJobs.push(retJob);
                });
                res.status(200).json(returnedJobs);
            }
        });
    }

    function patchJob(req, res) {
        var job = req.data;
        for (var key in req.body) {
            switch (key) {
                case '_id':
                    // Ignore.
                    break;
                default:
                    job[key] = req.body[key];
                    break;
            }
        }
        job.save(routingUtil.saveResponse(res, 200, job));
    }

    function registerJob(req, res) {
        var job = new jmdb.Job(req.body);
        job.save(routingUtil.saveResponse(res, 201, job));
    }

    function updateJob(req, res) {
        var job = req.data;
        job.displayName = req.body.displayName;
        job.description = req.body.description;
        job.status = req.body.status;
        job.configuration = req.body.configuration;
        job.minLogLevel = req.body.minLogLevel;
        job.installPath = req.body.installPath;
        job.version = req.body.version;
        job.save(routingUtil.saveResponse(res, 200, job));
    }

    var router = express.Router();

    router.use('/:jobID', routingUtil.findDocByID(jmdb.Job, 'jobID', 'Unable to find job.'));

    router.route('/')
        .get(getJobs)
        .post(registerJob);

    router.route('/:jobID')
        .delete(deleteJob)
        .get(getJob)
        .patch(patchJob)
        .put(updateJob);

    return router;
}

module.exports = jobRoutes;