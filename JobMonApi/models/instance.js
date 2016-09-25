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
    started: Date, // The time the running job first acknowledges the instance. (the agent starts the job and the first thing the job should do is acknowledge the instance)
    completed: Date, // The time the instance completed. A null here will count as a running instance, preventing new instances from starting.
    stop: Boolean, // Can be set to stop this instance after the current loop.
    errorMsgs: [{ // Log messages are stored in a log file, but we keep copies of any errors in MongoDB.
        created: Date, // The time the log message was created.
        logLevel: { // The level of the error. Should be only the error levels from jobSchema.minLogLevel.
            type: String,
            enum: ['Error', 'Fatal']
        },
        message: String, // The error message.
        details: String // An optional detailed description of the error. As an example, for .Net this might include the type of exception, exception message, and stack trace.
    }]
},{
    collection: 'instances'
});

/**
 * Work flow:
 * 1. The scheduler tells the agent to start the job.
 * 2. The agent checks to see if the most current version of the job is installed.
 * 3. If not installed, the agent uninstalls the old job (if it exists) and then installs the new job.
 * 4. The agent then creates a new instance.
 * 5. The agent starts the job, passing in the instance ID.
 * 6. The job calls the server to acknowledge the instance.
 * 7. The job can log messages and get updates about the instance from the server. 
 * 8. Once the job is complete, it calls the server to mark the instance as complete.
 * 
 * If the instance is created but not started, it will go into an error condition (amount of time configured by JobMon).
 * If the instance is started but not completed (amount of time configured by the job), it will go into an error condition. 
 */

instanceSchema.plugin(idvalidator);

module.exports = mongoose.model('instance', instanceSchema);
