var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var agentSchema = new Schema({
    host: { // The machine name of the host the agent is installed on.
        type: String,
        required: true
    },
    host_lower: { // A lower case version of host for efficient searches. This value must be unique.
        type: String,
        required: true,
        unique: true
    },
    hostDetails: String, // The details of a host, can include OS, memory, CPU, etc.
    url: {
        type: String,
        required: true,
        unique: true
    },
    enabled: Boolean, // Determines if the agent is enabled or not. 
    jobs: [{ // The jobs that are installed using this agent.
        jobID: ObjectId,
        version: Number // The version that is currently installed on the agent. If null, the job has not been installed on this agent yet. 
    }]
},{
    collection: 'agents'
});

module.exports = mongoose.model('agent', agentSchema);