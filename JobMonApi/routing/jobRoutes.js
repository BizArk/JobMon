var crypto = require('crypto');
var express = require('express');
var fs = require('fs');
var path = require('path');

var cfg = require('../config.js');
var routingUtil = require('./routingUtil.js');

function jobRoutes(jmdb) {

    function copyFile(srcPath, destPath, shouldHash, fn) {
        var fnCalled = false;
        var hash;

        if(shouldHash)
            hash = crypto.createHash('md5');

        var rd = fs.createReadStream(srcPath);
        rd.on('data', function (data) {
            hash.update(data, 'utf8');
        });
        rd.on("error", function (err) {
            done(err);
        });
        var wr = fs.createWriteStream(destPath);
        wr.on("error", function (err) {
            done(err);
        });
        wr.on("close", function (ex) {
            var fileHash = hash.digest('hex');
            done(null, fileHash);
        });
        rd.pipe(wr);

        function done(err, fileHash) {
            if (!fnCalled) {
                fn(err, fileHash);
                fnCalled = true;
            }
        }
    }

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
        //todo: copy install to local directory. Put the file through the hash.        
        var srcPath = path.resolve(global.appRoot, cfg.downloadPath, 'test', 'testjob.zip');
        var destPath = path.resolve(global.appRoot, cfg.downloadPath, 'jobs', 'testjob.zip');
        copyFile(srcPath, destPath, true, function (err, fileHash) {
            if(err) {
                res.status(400).json({
                    name: 'CopyFile',
                    message: err
                });
                return;
            }

            job.fileHash = fileHash;
            job.fileLastUpdated = Date.now();
            job.save(routingUtil.saveResponse(res, 201, job));
        });

        // hashFile(jobPath, function (fileHash) {
        //     job.fileHash = fileHash;
        //     job.fileLastUpdated = Date.now();
        //     job.save(routingUtil.saveResponse(res, 201, job));
        // });
        fs.cop
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