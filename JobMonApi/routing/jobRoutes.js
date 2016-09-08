var crypto = require('crypto');
var express = require('express');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var multer = require('multer');

var cfg = require('../config.js');
var routingUtil = require('./routingUtil.js');

function jobRoutes(jmdb) {

    function copyFile(srcPath, destPath, shouldHash, fn) {
        var fnCalled = false;
        var hash;

        if (shouldHash)
            hash = crypto.createHash('md5');

        // Make sure the directory is created 
        // before copying files to it.
        var destDir = path.dirname(destPath);
        mkdirp(destDir, function (err) {
            if (err)
                console.error(err);
        });

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
        var destPath = path.resolve(global.appRoot, cfg.downloadPath, 'jobs', job._id + '.zip');
        fs.unlink(destPath, function (err) {
            if (err)
                return done(err);
            job.remove(routingUtil.saveResponse(res, 204));
        });
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

    function uploadJob(req, res) {
        var job = req.data;

        var srcPath = req.file.path;
        var destPath = path.resolve(global.appRoot, cfg.downloadPath, 'jobs', job._id + '.zip');
        copyFile(srcPath, destPath, true, function (err, fileHash) {
            if (err) {
                res.status(400).json({
                    name: 'CopyFile',
                    message: err
                });
                return;
            }

            job.fileHash = fileHash;
            job.fileLastUpdated = Date.now();
            job.save(routingUtil.saveResponse(res, 201, job));

            fs.unlink(srcPath);
        });
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

    var parseUploads = multer({
        dest: path.resolve(global.appRoot, cfg.uploadPath),
        onFileUploadStart: function (file) {
            console.log(file.originalname + ' is starting ...')
        },
        onFileUploadComplete: function (file) {
            console.log(file.fieldname + ' uploaded to  ' + file.path)
            imageUploaded = true;
        }
    });

    router.use('/:jobID', routingUtil.findDocByID(jmdb.Job, 'jobID', 'Unable to find job.'));

    router.route('/')
        .get(getJobs)
        .post(registerJob, parseUploads.single('jobinstall'));

    router.route('/:jobID')
        .delete(deleteJob)
        .get(getJob)
        .patch(patchJob)
        .put(updateJob);

    router.route('/:jobID/upload')
        .post(parseUploads.single('job'), uploadJob);

    return router;
}

module.exports = jobRoutes;