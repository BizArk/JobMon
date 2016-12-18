function routingSetup(app, jmdb) {
    app.use('/api',             require('./agentRoutes.js')(jmdb));
    app.use('/api/instances',   require('./instanceRoutes.js')(jmdb));
}

module.exports = routingSetup;
