function routingSetup(app, jmdb) {
    app.use('/api/admin',       require('./adminRoutes.js')(jmdb));
    app.use('/api/agents',      require('./agentRoutes.js')(jmdb));
    app.use('/api/jobs',        require('./jobRoutes.js')(jmdb));
    app.use('/api/instances',   require('./instanceRoutes.js')(jmdb));
}

module.exports = routingSetup;
