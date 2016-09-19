var express = require('express');
var routingUtil = require('./routingUtil.js');

function instanceRoutes(jmdb) {

    function createInstance(req, res) {
        var instance = new jmdb.Instance(req.body);
        instance.save(routingUtil.saveResponse(res, 201, instance));
    }

    function deleteInstance(req, res) {
        var instance = req.data;
        jmdb.Instance.remove(routingUtil.saveResponse(res, 204));
    }

    function getInstance(req, res) {
        return res.status(200).json(req.data);
    }

    function getInstances(req, res) {
        jmdb.Instance.find(function (err, instances) {
            if (err)
                res.status(500).send(err);
            else {
                var returnedInstances = [];
                instances.forEach(function (instance) {
                    var retInstance = instance.toJSON();
                    retInstance.links = {
                        self: `http://${req.headers.host}/api/instances/${retInstance._id}`
                    };
                    returnedInstances.push(retInstance);
                });
                res.status(200).json(returnedInstances);
            }
        });
    }

    function patchInstance(req, res) {
        var instance = req.data;
        for (var key in req.body) {
            switch (key) {
                case '_id':
                    // Ignore.
                    break;
                default:
                    instance[key] = req.body[key];
                    break;
            }
        }
        instance.save(routingUtil.saveResponse(res, 200, instance));
    }

    function updateInstance(req, res) {
        var instance = req.data;
        instance.displayName = req.body.displayName;
        instance.description = req.body.description;
        instance.status = req.body.status;
        instance.configuration = req.body.configuration;
        instance.minLogLevel = req.body.minLogLevel;
        instance.installPath = req.body.installPath;
        instance.version = req.body.version;
        instance.save(routingUtil.saveResponse(res, 200, instance));
    }

    var router = express.Router();

    router.use('/:instanceID', routingUtil.findDocByID(jmdb.Instance, 'instanceID', 'Unable to find instance.'));

    router.route('/')
        .get(getInstances)
        .post(createInstance);

    router.route('/:instanceID')
        .delete(deleteInstance)
        .get(getInstance)
        .patch(patchInstance)
        .put(updateInstance);

    return router;
}

module.exports = instanceRoutes;