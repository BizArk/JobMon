var crypto = require('crypto');
var express = require('express');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var multer = require('multer');
var debug = require('debug')('jobmon.route.job')
var AdmZip = require('adm-zip');
var request = require('superagent');
var async = require('async');

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
            if (hash)
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
            if (hash) {
                var fileHash = hash.digest('hex');
                done(null, fileHash);
            } else {
                done(null, null);
            }
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
        var retJob = req.data.toJSON();
        retJob.links = {
            download: `http://${req.headers.host}/downloads/jobs/${retJob._id}.zip`
        };
        return res.status(200).json(retJob);
    }

    function getJobs(req, res) {

        routingUtil.queryData(req, jmdb.Job, function (response) {
            var jobs = response.data;
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
            response.data = returnedJobs;
            res.status(200).json(response);
        });

    }

    function patchJob(req, res) {
        var job = req.data;
        for (var key in req.body) {
            switch (key) {
                case 'status': // Only field that can be updated. The rest should be updated in the file.
                    job[key] = req.body[key];
                    break;
            }
        }
        job.save(routingUtil.saveResponse(res, 200, job));
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
            job.status = jobCfg.status || job.status || 'Enabled';
            job.minLogLevel = jobCfg.minLogLevel || job.minLogLevel || 'Info';
            job.maxInstances = jobCfg.maxInstances || job.maxInstances || 1;
            job.maxInstancesToKeep = jobCfg.maxInstancesToKeep || job.maxInstancesToKeep || 100;
            job.maxTimeToCompleteInMinutes = jobCfg.maxTimeToCompleteInMinutes;
            job.autoComplete = jobCfg.autoComplete;
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

    function startJob(req, res) {
        var job = req.data;

        jmdb.Install.find({ job: job._id })
            .populate('agent')
            .exec(function(err, installs) {
                if (err) {
                    debug(err);
                    err = routingUtil.toStandardErr(err);
                    return res.status(400).json(err);
                }

                if(installs.length == 0) {
                    debug('Job ' + job.displayName + ' is not installed on any agents.');
                    return res.status(400).json({
                        message: job.displayName + ' is not installed on any agents.',
                        name: 'NotInstalled'
                    });
                }

                // We want to randomly select an agent to run this job on.
                // If that agent isn't available, keep going until we find one.
                var startidx = Math.floor(Math.random() * installs.length);
                var i = 0;
                async.whilst(
                    function() {
                        // We check inside the next method to make sure we don't overflow the agents.
                        return true;
                    },
                    function(callback) {
                        // Make sure we don't overflow the agents.
                        if(i >= installs.length)
                            return callback({ name:'AgentNotAvailable', message: 'Unable to find an agent to run ' + job.displayName });

                        // Determine the index of the agent to check.
                        var idx = (startidx+i) % installs.length;
                        var install = installs[idx];
                        var agent = install.agent;
                        i++; // Increment in case this isn't the one.
                        if(!agent.enabled) // The agent is disabled, so don't run the instance on it.
                            return callback(null, null);

                        var instance = new jmdb.Instance();
                        instance.job = job._id;
                        instance.agent = agent._id;
                        instance.status = 'Starting';
                        instance.save(function saveInstance(err) {
                            if (err) {
                                return callback(err);
                            } else {
                                request
                                    .post(agent.url + '/instances/' + instance._id + '/start')
                                    .send(instance)
                                    .set('Accept', 'application/json')
                                    .end(function(err, startRes) {
                                        if(!err) 
                                            return callback(null, instance);

                                        // Something wrong with the agent. 
                                        // Delete the instance.
                                        debug('Unable to start ' + job.displayName + ' on ' + agent.host + '. Removing the instance.');
                                        instance.remove();

                                        if(err.code == 'ENOTFOUND') {
                                            debug('Could not reach ' + agent.host + '. Try the next agent.');
                                            //todo: Should we mark the agent as not accessible?
                                            return callback(null, null);
                                        } else {
                                            return callback(err, null);
                                        }

                                    });
                            }
                        });
                    },
                    function(err, instance) {
                        if(err) {
                            return res.status(400).json(routingUtil.toStandardErr(err));
                        } else {
                            return res.status(200).json(instance);
                        }
                    }
                )
                
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
        .get(getJob)
        .patch(patchJob);

    router.route('/:jobID/start')
        .post(startJob);

    return router;
}

module.exports = jobRoutes;