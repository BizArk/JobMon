var request = require('supertest');
var app = require('../app.js');
var http = request(app);
var testAgents = require('./agentTests.js');
var testJobs = require('./jobTests.js');
var testInstances = require('./instanceTests.js');

before(function (done) {
    http
        .delete('/api/admin/db')
        .expect(204)
        .end(done);
});

testAgents(http);
testJobs(http);
testInstances(http);
