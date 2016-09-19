var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var idvalidator = require('mongoose-id-validator');

var installSchema = new Schema({
    job: { // The job that is installed.
        type: ObjectId,
        required: true,
        ref: 'job'
    },
    agent: { // The agent that the job is installed on.
        type: ObjectId,
        required: true,
        ref: 'agent'
    },
    fileHash: String, // The hash of the installed job file.
    uninstall: Boolean // If true, this install is marked for uninstallation. This record will be deleted once the agent uninstalls it. 
}, {
        collection: 'installs'
    });

installSchema.index({ job: 1, agent: 1 }, { unique: true });
installSchema.plugin(idvalidator);

module.exports = mongoose.model('install', installSchema);