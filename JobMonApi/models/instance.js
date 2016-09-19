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
    fileHash: { // The fileHash of the job that was started. This must be sent by the agent based on the hash of the file that is installed when the instance is started. It should be the most recent, but isn't required to be.'
        type: String,
        required: true
    },
    started: { // The time the instance was started.
        type: Date,
        required: true,
        default: Date.now
    },
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

instanceSchema.plugin(idvalidator);

module.exports = mongoose.model('instance', instanceSchema);
