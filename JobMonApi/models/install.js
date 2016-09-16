var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var installSchema = new Schema({
    jobID: { // The job that is installed.
        type: ObjectId,
        required: true,
        ref: 'job'
    },
    agentID: { // The agent that the job is installed on.
        type: ObjectId,
        required: true,
        ref: 'agent'
    },
    fileHash: String, // The hash of the installed job file.
    uninstall: Boolean // If true, this install is marked for uninstallation. This record will be deleted once the agent uninstalls it. 
}, {
        collection: 'installs'
    });

installSchema.index({ jobID: 1, agentID: 1 }, { unique: true });

module.exports = mongoose.model('install', installSchema);