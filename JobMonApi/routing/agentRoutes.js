var express = require('express');
var routingUtil = require('./routingUtil.js');

function agentRoutes(jmdb) {

    function deleteAgent(req, res) {
        var agent = req.data;
        agent.remove(routingUtil.saveResponse(res, 204));
    }

    function getAgent(req, res) {
        return res.status(200).json(req.data);
    }

    function getAgents(req, res) {
        routingUtil.queryData(req, jmdb.Agent, function (response) {
            var agents = response.data;
            var returnedAgents = [];
            agents.forEach(function (agent) {
                var retAgent = agent.toJSON();
                retAgent.links = {
                    self: `http://${req.headers.host}/api/agents/${retAgent._id}`
                };
                returnedAgents.push(retAgent);
            });
            response.data = returnedAgents
            res.status(200).json(response);
        });
    }

    function patchAgent(req, res) {
        var agent = req.data;
        for (var key in req.body) {
            switch (key) {
                case 'enabled':
                case 'hostDetails':
                    // These are the only fields we allow to be updated in the agent.
                    agent[key] = req.body[key];
                    break;
                default:
                    // Ignore.
                    break;
            }
        }
        agent.save(routingUtil.saveResponse(res, 200, agent));
    }

    function registerAgent(req, res) {
        var agent = new jmdb.Agent(req.body);
        var host_lower = (agent.host || '').toLowerCase();

        // verify that this host doesn't already have a value in the database.
        jmdb.Agent.findOne({ host_lower: host_lower }, function (err, existingAgent) {
            if (err) {
                return res.status(400).json({
                    message: err,
                    name: 'QueryError'
                });
            }

            if (existingAgent) {
                existingAgent.host = req.body.host;
                existingAgent.hostDetails = req.body.hostDetails;
                existingAgent.url = req.body.url;
                existingAgent.save(routingUtil.saveResponse(res, 200, agent));
            } else {
                // These should always be true.
                agent.host_lower = host_lower;
                agent.enabled = true;
                agent.lastCheckin = null;
                agent.save(routingUtil.saveResponse(res, 201, agent));
            }
        });
    }

    var router = express.Router();

    router.use('/:agentID', routingUtil.findDocByID(jmdb.Agent, 'agentID', 'Unable to find agent.'));

    router.route('/')
        .get(getAgents)
        .post(registerAgent);

    router.route('/:agentID')
        .delete(deleteAgent)
        .get(getAgent)
        .patch(patchAgent);

    return router;
}

module.exports = agentRoutes;