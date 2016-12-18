var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var idvalidator = require('mongoose-id-validator');

var instanceSchema = new Schema({
    job: { // Reference to the job that this is an instance of.
        type: ObjectId,
        required: true,
        ref: 'job'
    }, 
    agent: { // Reference to the agent that started this instance.
        type: ObjectId,
        required: true,
        ref: 'agent'
    }, 
    created: { // The time the instance was created.
        type: Date,
        required: true,
        default: Date.now
    },
    status: {
        type: String,
        required: true,
        enum: ['Starting', 'Installing', 'Running', 'Cancelling', 'Completed', 'Cancelled', 'Error']
    },
    started: Date, // The time the running job first acknowledges the instance. (the agent starts the job and the first thing the job should do is acknowledge the instance)
    completed: Date, // The time the instance completed. A null here will count as a running instance, preventing new instances from starting.
    stop: Boolean // Can be set to stop this instance after the current loop.
},{
    collection: 'instances'
});

/**
 * Work flow:
 * 01. The scheduler tells the API to start the job.
 * 02. The API searches for an agent and calls into the agent API to start the job.
 * 03. The agent requests a new instance from the API with a status of 'Starting'.
 * 04. The agent checks to see if the most current version of the job is installed.
 * 05. If not installed, the agent sets the instance status to 'Installing' and uninstalls the old job (if it exists) then installs the new job.
 * 06. The agent starts the job, passing in the instance ID.
 * 07. The job calls the server to acknowledge the instance. The status of the instance is changed to 'Running'.
 * 08. The job can log messages and get updates about the instance from the server. 
 * 09. Once the job is complete, it calls the server to mark the instance as complete. The status is changed to 'Completed'.
 * 
 * If the instance is created but not started, it will go into an error condition (amount of time configured by JobMon). Status changed to 'Error'.
 * If the instance is started but not completed (amount of time configured by the job), it will go into an error condition. Status changed to 'Error'.
 * If the instance exits unexpectedly, the status is changed to 'Error'.
 * If the instance is canceled for any reason (job disabled, agent disabled, stopped, etc), the status is changed to 'Cancelling'. Once it exits, the status is changed to 'Cancelled'.
 */

instanceSchema.index({ job: 1 });
instanceSchema.index({ agent: 1 });
instanceSchema.plugin(idvalidator);

module.exports = mongoose.model('instance', instanceSchema);
