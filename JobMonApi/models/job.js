var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var jobSchema = new Schema({
    displayName: { 
        type: String,
        required: true,
        unique: true
    },
    description: String,
    status: {
        type: String,
        enum: ['Enabled', 'Disabled', 'Error']
    },
    configuration: String, // Json blob that is sent to the job.
    minLogLevel: { // Only log messages that are at this level and to the right of it (see enum)
        type: String,
        enum: ['Trace', 'Debug', 'Info', 'Warn', 'Error', 'Fatal']
    },
    fileHash: { // A hash of the file so we can know if it is the one that is installed or not. 
        type: String,
        required: true
    },
    fileLastUpdated: {
        type: Date,
        required: true
    },
    numberOfInstances: { // The maximum number of instances that we will keep. Oldest instance and associated log files will be deleted as new instances are created.
        type: Number,
        min: 1
    },
    schedule: { // The schedule used to run the job.
        minutes: { // Interval (ex, every 5 minutes)
            type: Number,
            min: 1
        },
        timeOfDay: { // Minutes from midnight (local)
            type: Number,
            min: 0
        },
        daysOfWeek: { // Days of the week to run the job
            type: String,
            enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        }

    }
},{
    collection: 'jobs'
});

module.exports = mongoose.model('job', jobSchema);