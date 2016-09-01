var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var agentSchema = new Schema({
    host: String, // The machine name of the host the agent is installed on.
    hostDetails: String, // The details of a host, can include OS, memory, CPU, etc.
    enabled: Boolean, // Determines if the agent is enabled or not. 
    lastCheckin: Date, // Agents need to ping the server occassionally to ensure they are running correctly. 
    jobs: [{ // The jobs that are installed using this agent.
        jobID: ObjectId,
        version: Number // The version that is currently installed on the agent. If null, the job has not been installed on this agent yet. 
    }]
},{
    collection: 'agents'
});

module.exports = mongoose.model('agent', agentSchema);