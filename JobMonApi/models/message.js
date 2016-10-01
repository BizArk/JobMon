var mongoose = require('mongoose');
var idvalidator = require('mongoose-id-validator');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var messageSchema = new Schema({
    instance: { // Reference to the instance this is a message for.
        type: ObjectId,
        required: true,
        ref: 'instance'
    },
    job: { // Reference to the job that this is a message for (makes looking it up by job easier).
        type: ObjectId,
        required: true,
        ref: 'job'
    },
    created: { // The time the message was created.
        type: Date,
        required: true,
        default: Date.now
    },
    logLevel: { // The level of the message. 
        type: String,
        enum: ['Trace', 'Debug', 'Info', 'Warn', 'Error', 'Fatal'] // Should be only the same levels as in jobSchema.minLogLevel.
    },
    message: { // The error message.
        type: String,
        required: true
    },
    details: String, // An optional detailed description of the error. As an example, for .Net this might include the type of exception, exception message, and stack trace.
    source: String // An optional value that can be used to help identify the source of an error. It's suggested to use a numeric value and each call to log a message would have a unique value.
}, {
        collection: 'messages'
    });

messageSchema.index({ instance: 1 });
messageSchema.index({ job: 1 });
messageSchema.plugin(idvalidator);

module.exports = mongoose.model('message', messageSchema);
