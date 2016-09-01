var express = require('express');
var routingUtil = require('./routingUtil.js');

function jobRoutes(Job) {

    function createJob(req, res) {
        var job = new Job(req.body);
        job.save();
        
        res.status(201).json(job);
    }

    function deleteJob(req, res) {
        var job = req.data;

        job.remove(function(err) {
            if(err)
                return res.status(500).send(err);
            else
                return res.status(204).send('Removed');
        });

    }

    function getJob(req, res) {
        return res.status(200).json(req.data);
    }

    function getJobs(req, res) {
        Job.find(function(err, jobs){
            if(err) 
                res.status(500).send(err);
            else {
                var returnedJobs = [];                
                jobs.forEach(function(job) {
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
        for(var key in req.body) {
            switch(key) {
                case '_id':
                    // Ignore.
                    break;
                default:
                    job[key] = req.body[key];
                    break;
            }
        }
        job.save();
        return res.status(200).json(job);
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
        job.save();
        
        res.status(200).json(job);
    }

    var router = express.Router();

    router.use('/:jobID', routingUtil.findDocByID(Job, 'jobID', 'Unable to find job.'));

    router.route('/')
        .get(getJobs)
        .post(createJob);

    router.route('/:jobID')
        .delete(deleteJob)
        .get(getJob)
        .patch(patchJob)
        .put(updateJob);

    return router;
}

module.exports = jobRoutes;