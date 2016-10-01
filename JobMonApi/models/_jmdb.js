
// This is the schema for BizArk JobMon MongoDB.
var jmdb = {
    Agent: require('./agent.js'),
    Job: require('./job.js'),
    Instance: require('./instance.js'),
    Install: require('./install.js'),
    Message: require('./message.js')
}

module.exports = jmdb;
