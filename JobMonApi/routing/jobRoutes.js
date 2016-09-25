var crypto = require('crypto');
var express = require('express');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var multer = require('multer');
var debug = require('debug')('jobmon.route.job')
var AdmZip = require('adm-zip');

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
                    if (retJob.fileHash) {
                        retJob.links.download = `http://${req.headers.host}/downloads/jobs/${retJob._id}.zip`;
                    }
                    returnedJobs.push(retJob);
                });
                res.status(200).json(returnedJobs);
            }
        });
    }

    function registerJob(req, res) {
        if (!req.file) {
            return res.status(400).json({
                name: 'FileMissing',
                message: 'The install for the job is required.'
            });
        }

        var srcPath = req.file.path;

        var zip = new AdmZip(srcPath);
        var json = zip.readAsText('jobmon.json');
        if (!json) {
            return res.status(400).json({
                name: 'InvalidJobFile',
                message: 'The jobmon.json configuration file is required for job files.'
            });
        }

        json = json.replace(/\0/g, '').trim(); // Make sure the JSON is valid.
        var jobCfg = JSON.parse(json);

        var query = jmdb.Job.find({ name: jobCfg.name });
        query.exec(function (err, jobs) {

            if (err) {
                debug(err);
                err = routingUtil.toStandardErr(err);
                return res.status(400).json(err);
            }

            var job;
            var newJob = false;
            if (jobs.length > 0) {
                debug('Found job');
                job = jobs[0];
            } else {
                debug('NEW JOB');
                newJob = true;
                job = new jmdb.Job();
                job.name = jobCfg.name;
                job.status = 'Enabled';
            }

            job.displayName = jobCfg.displayName || jobCfg.name;
            job.description = jobCfg.description;
            job.minLogLevel = jobCfg.minLogLevel || 'Info';
            job.numberOfInstances = jobCfg.numberOfInstances || 1;
            debug(job);

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
                job.save(routingUtil.saveResponse(res, newJob ? 201 : 200, job));

                fs.unlink(srcPath);
            });
        });

    }

    var router = express.Router();

    var parseUploads = multer({
        dest: path.resolve(global.appRoot, cfg.uploadPath),
        onFileUploadStart: function (file) {
            debug(file.originalname + ' is starting ...')
        },
        onFileUploadComplete: function (file) {
            debug(file.fieldname + ' uploaded to  ' + file.path)
            imageUploaded = true;
        }
    });

    router.use('/:jobID', routingUtil.findDocByID(jmdb.Job, 'jobID', 'Unable to find job.'));

    router.route('/')
        .get(getJobs)
        .post(parseUploads.single('job'), registerJob);

    router.route('/:jobID')
        .delete(deleteJob)
        .get(getJob);

    return router;
}

module.exports = jobRoutes;