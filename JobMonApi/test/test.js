var debug = require('debug')('jobmon.test.main')
var cfg = require('../config.js');
var request = require('supertest');
var testAgents = require('./agentTests.js');
var testJobs = require('./jobTests.js');
var testInstalls = require('./installTests.js');
var testInstances = require('./instanceTests.js');
var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');
var app = require('../app.js');
var async = require('async');

describe('Initialize tests', function () {
    it('drop collections', function (done) {
        debug('dropping collections...');

        async.eachSeries(app.jmdb, function (coll, cb) {
            if (!coll.remove) return cb(); // If it doesn't have a remove, then it must not be a collection.

            coll.remove(function (err) {
                if (err) return cb(err);

                debug(coll.name + ' removed');
                cb();
            });
        }, function (err) {
            return done(err);
        });
    });

    it('remove job files', function () {
        debug('removing job files...');

        return new Promise(function (resolve, reject) {
            // Remove any job files that have been created before. 
            rimraf(path.resolve(cfg.downloadPath, 'jobs'), function (err) {
                if (err) reject(err);

                debug('rimraf complete');
                resolve();
            });
        });
    });
});

describe('Running tests', function () {
    debug('running tests...');

    var http = request(app);

    testAgents(http);
    testJobs(http);
    testInstalls(http);
    testInstances(http);
});
