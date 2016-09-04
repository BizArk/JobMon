var express = require('express');
var routingUtil = require('./routingUtil.js');

function agentRoutes(jmdb) {

    function createAgent(req, res) {
        var agent = new jmdb.Agent(req.body);
        agent.save();
        
        res.status(201).json(agent);
    }

    function deleteAgent(req, res) {
        var agent = req.data;

        agent.remove(function(err) {
            if(err)
                return res.status(500).send(err);
            else
                return res.status(204).send('Removed');
        });

    }

    function getAgent(req, res) {
        return res.status(200).json(req.data);
    }

    function getAgents(req, res) {
        jmdb.Agent.find(function(err, agents){
            if(err) 
                res.status(500).send(err);
            else {
                var returnedAgents = [];                
                agents.forEach(function(agent) {
                    var retAgent = agent.toJSON();
                    retAgent.links = {
                        self: `http://${req.headers.host}/api/agents/${retAgent._id}`
                    };
                    returnedAgents.push(retAgent);
                });
                res.status(200).json(returnedAgents);
            }
        });
    }

    function patchAgent(req, res) {
        var agent = req.data;
        for(var key in req.body) {
            switch(key) {
                case '_id':
                    // Ignore.
                    break;
                default:
                    agent[key] = req.body[key];
                    break;
            }
        }
        agent.save();
        return res.status(200).json(agent);
    }

    function updateAgent(req, res) {
        var agent = req.data;
        console.log(req.body);
        
        agent.host = req.body.host;
        agent.hostDetails = req.body.hostDetails;
        agent.enabled = req.body.enabled;
        agent.lastCheckin = req.body.lastCheckin;
        agent.save();
        
        res.status(200).json(agent);
    }

    var router = express.Router();

    router.use('/:agentID', routingUtil.findDocByID(jmdb.Agent, 'agentID', 'Unable to find agent.'));

    router.route('/')
        .get(getAgents)
        .post(createAgent);

    router.route('/:agentID')
        .delete(deleteAgent)
        .get(getAgent)
        .patch(patchAgent)
        .put(updateAgent);

    return router;
}

module.exports = agentRoutes;