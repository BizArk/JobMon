var request = require('supertest');
var app = require('../app.js');
var cfg = require('../config.js');
var http = request(app);
var testAgents = require('./agentTests.js');
var testJobs = require('./jobTests.js');
var testInstalls = require('./installTests.js');
var testInstances = require('./instanceTests.js');
var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');

// Clear the database so we can start fresh.
before(function (done) {
    http
        .delete('/api/admin/db')
        .expect(204)
        .end(done);
});

// Remove any job files that have been created before. 
before(function(done) {
    rimraf(path.resolve(cfg.downloadPath, 'jobs'), function(err) {
        done(err);
    });
});

testAgents(http);
testJobs(http);
testInstalls(http);
//testInstances(http);
