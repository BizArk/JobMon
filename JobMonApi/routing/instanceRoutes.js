var express = require('express');
var routingUtil = require('./routingUtil.js');
var debug = require('debug')('jobmon.route.instance')

function instanceRoutes(jmdb) {

    function completeInstance(req, res) {
        var instance = req.data;
        instance.completed = Date.now();
        instance.save(routingUtil.saveResponse(res, 200, instance));
    }

    function createInstance(req, res) {
        var instance = new jmdb.Instance(req.body);
        jmdb.Agent.findById(instance.agent, function (err, agent) {
            if (!agent) {
                // Let Mongoose handle missing agent (better error messages).
                return instance.save(routingUtil.saveResponse(res, 201, instance));
            }

            if (!agent.enabled) {
                return res.status(400).json({
                    name: 'AgentDisabled',
                    message: `${agent.host} has been disabled.`
                });
            }

            jmdb.Job.findById(instance.job, function (err, job) {
                if (err) {
                    err = toStandardErr(err);
                    return res.status(400).json(err);
                }

                if (!job) {
                    // Let Mongoose handle missing job (better error messages).
                    return instance.save(routingUtil.saveResponse(res, 201, instance));
                }

                if (job.status != 'Enabled') {
                    var msg;
                    if (job.status == 'Disabled')
                        msg = `${job.displayName} has been disabled.`;
                    else
                        msg = `${job.displayName} is in an error state and cannot be started.`;
                    return res.status(400).json({
                        name: 'JobDisabled',
                        message: msg
                    });
                }

                if ((job.maxInstances || 0) <= 0) {
                    // maxInstances not set, so go ahead and create a new one.
                    return instance.save(routingUtil.saveResponse(res, 201, instance));
                }

                // Check to see how many instances are currently running.
                jmdb.Instance.count({ job: instance.job, completed: null }, function (err, count) {
                    if (err) {
                        err = toStandardErr(err);
                        return res.status(400).json(err);
                    }

                    if (count >= job.maxInstances) {
                        return res.status(400).json({
                            name: 'MaxInstancesExceeded',
                            message: `Unable to start ${job.displayName}. Exceeded max instances of ${job.maxInstances}.`
                        });
                    }

                    return instance.save(routingUtil.saveResponse(res, 201, instance));

                });
            });
        });

    }

    function getInstance(req, res) {
        return res.status(200).json(req.data);
    }

    function getInstances(req, res) {
        jmdb.Instance.find(function (err, instances) {
            if (err)
                return res.status(500).send(err);

            var returnedInstances = [];
            instances.forEach(function (instance) {
                var retInstance = instance.toJSON();
                retInstance.links = {
                    self: `http://${req.headers.host}/api/instances/${retInstance._id}`
                };
                returnedInstances.push(retInstance);
            });
            res.status(200).json(returnedInstances);
        });
    }

    function getMessages(req, res) {
        var instance = req.data;

        jmdb.Message.find({ instance: instance._id })
            .select('-_id -job -instance')
            .exec(function (err, messages) {
                if (err)
                    return res.status(500).send(err);

                return res.status(200).json(messages);
            });
    }

    function logMessage(req, res) {
        var instance = req.data;
        var msg = req.body;

        if (!instance.started) {
            return res.status(400).json({
                name: 'InstanceNotStarted',
                message: 'Cannot log messages until the instance has been started.'
            });
        }

        if (instance.completed) {
            return res.status(400).json({
                name: 'InstanceCompleted',
                message: 'Cannot log messages once the instance has been completed.'
            });
        }

        var logLevels = jmdb.Job.schema.path('minLogLevel').enumValues;
        var logLevelIdx = logLevels.indexOf(msg.logLevel);
        if (logLevelIdx < 0) {
            return res.status(400).json({
                name: 'InvalidLogLevel',
                message: `The log level is not valid. Must be one of the following: [${logLevels.toString()}]`
            });
        }

        jmdb.Job.findById(instance.job, function (err, job) {
            if (err)
                return res.status(500).send(err);

            if (!job) {
                return res.status(400).json({
                    name: 'JobNotFound',
                    message: 'Unable to find the job associated with this instance.'
                });
            }

            var minLogLevelIdx = logLevels.indexOf(job.minLogLevel);
            debug(job);
            if (logLevelIdx < minLogLevelIdx) {
                return res.status(200).json({
                    message: `The message was not logged. The log level (${msg.logLevel}) was less than the minimum logging level for the job (${job.minLogLevel}).`
                });
            }

            var logMsg = new jmdb.Message(msg);
            logMsg.instance = instance._id;
            logMsg.job = job._id;

            return logMsg.save(routingUtil.saveResponse(res, 201, logMsg));
        });
    }

    function patchInstance(req, res) {
        var instance = req.data;
        for (var key in req.body) {
            switch (key) {
                case 'stop': // Only fields allowed to be patched.
                    instance[key] = req.body[key];
                    break;
            }
        }
        instance.save(routingUtil.saveResponse(res, 200, instance));
    }

    function startInstance(req, res) {
        var instance = req.data;
        instance.started = Date.now();
        instance.save(routingUtil.saveResponse(res, 200, instance));
    }

    var router = express.Router();

    router.use('/:instanceID', routingUtil.findDocByID(jmdb.Instance, 'instanceID', 'Unable to find instance.'));

    router.route('/')
        .get(getInstances)
        .post(createInstance);

    router.route('/:instanceID')
        .get(getInstance)
        .patch(patchInstance);

    router.route('/:instanceID/start')
        .put(startInstance);

    router.route('/:instanceID/logs')
        .get(getMessages)
        .post(logMessage);

    router.route('/:instanceID/complete')
        .put(completeInstance);

    return router;
}

module.exports = instanceRoutes;