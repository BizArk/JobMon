var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var instanceSchema = new Schema({
    jobID: ObjectId, // Reference to the job that this is an instance of.
    jobVersion: Number, // The version of the job that was started.
    agentID: ObjectId, // Reference to the agent that started this instance.
    started: Date, // The time the instance was started.
    completed: Date, // The time the instance completed. A null here will count as a running instance, preventing new instances from starting.
    stop: Boolean, // Can be set to stop this instance after the current loop.
    processID: String, // The ID of the process on the host machine.
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

module.exports = mongoose.model('instance', instanceSchema);