var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var jobSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    displayName: {
        type: String,
        required: true
    },
    description: String,
    status: {
        type: String,
        enum: ['Enabled', 'Disabled', 'Error']
    },
    minLogLevel: { // Only log messages that are at this level and to the right of it (see enum)
        type: String,
        enum: ['Trace', 'Debug', 'Info', 'Warn', 'Error', 'Fatal']
    },
    maxInstances: { // The maximum number of instances that can be running at a time.
        type: Number,
        min: 1
    },
    maxInstancesToKeep: { // The maximum number of instances that we will keep. Oldest instance and associated log files will be deleted as new instances are created.
        type: Number,
        min: 1
    },
    maxTimeToCompleteInMinutes: { // The maximum amount of time for a job to take to run before calling complete. Tracked by the scheduler.
        type: Number,
        min: 1
    },
    autoComplete: Boolean, // If the job takes too long to complete, this will automatically mark it as completed. It will not stop the process, but if the process is still running, it will get a disabled notice. If false (default), the job will go into an error state.  
    fileHash: String, // A hash of the file so we can know if it is the one that is installed or not. 
    fileLastUpdated: Date // The last time the file was uploaded.
}, {
        collection: 'jobs'
    });

module.exports = mongoose.model('job', jobSchema);
