var assert = require('assert');
var debug = require('debug')('jobmon.test.Instances')
var async = require('async');

function testInstances(http) {
    var lastInstance;
    var jobs;
    var agents;
    var testJob1;
    var testJob2;

    describe('Instances', function () {

        before(function (done) {
            debug('getting jobs and agents.');
            async.series([
                function (fn) { http.get('/api/jobs').expect(200).end(function (err, res) { fn(null, res.body); }); },
                function (fn) { http.get('/api/agents').expect(200).end(function (err, res) { fn(null, res.body); }); },
            ], function (err, results) {
                if (results) {
                    jobs = results[0];
                    agents = results[1];
                    testJob1 = jobs.find(j => j.name == 'TestJob01');
                    testJob2 = jobs.find(j => j.name == 'TestJob02');
                }
                done(err);
            });
        });

        describe('getting list of instances', function () {
            it('should return no instances', function (done) {
                http
                    .get('/api/instances')
                    .expect(200)
                    .expect(function (res) {
                        var instances = res.body;
                        assert.equal(0, instances.length);
                    })
                    .end(done);
            });
        });

        describe('start instance', function () {
            it('without required information', function (done) {
                http
                    .post('/api/instances')
                    .expect(400)
                    .expect(function (res) {
                        var errs = res.body;
                        assert.equal('ValidationError', errs.name);
                    })
                    .end(done);
            });

            it('with bad job and agent ids', function (done) {
                http
                    .post('/api/instances')
                    .send({
                        job: '57df1db4c52009ec09e36b9d',
                        agent: '57df1db4c52009ec09e36b9d',
                        fileHash: 'abc123'
                    })
                    .expect(400)
                    .expect(function (res) {
                        var errs = res.body;
                        assert.equal('ValidationError', errs.name);
                        assert.ok(errs.errors.job);
                        assert.equal('job references a non existing ID', errs.errors.job.message);
                    })
                    .end(done);
            });

            it('with required information', function (done) {

                var agent = agents[0];

                http.post('/api/instances')
                    .send({
                        job: testJob1._id,
                        agent: agent._id
                    })
                    .expect(201)
                    .expect(function (res) {
                        var instance = lastInstance = res.body;
                        assert.ok(instance._id);
                        assert.ok(!instance.started);
                    })
                    .end(done);

            });

            it('cannot be deleted', function (done) {
                // Instances should not be removed directly.
                // They are removed by the scheduler when it 
                // hits maxInstancesToKeep.
                http
                    .del(`/api/instances/${lastInstance._id}`)
                    .expect(404)
                    .end(done);
            });

            it('can be started', function(done) {
                http.put(`/api/instances/${lastInstance._id}/start`)
                    .expect(200)
                    .end(done);
            });

            it('cannot create more than 1 running instance', function (done) {

                var agent = agents[0];

                http.post('/api/instances')
                    .send({
                        job: testJob1._id,
                        agent: agent._id
                    })
                    .expect(400)
                    .expect(function(res) {
                        debug(res.body.message);
                        assert.ok(res.body.name == 'MaxInstancesExceeded')
                    })
                    .end(done);

            });

            it('can be completed', function(done) {
                http.put(`/api/instances/${lastInstance._id}/complete`)
                    .expect(200)
                    .end(done);
            });

            it('can be started after other instance completed', function (done) {

                var agent = agents[0];

                http.post('/api/instances')
                    .send({
                        job: testJob1._id,
                        agent: agent._id
                    })
                    .expect(201)
                    .expect(function (res) {
                        var instance = lastInstance = res.body;
                        assert.ok(instance._id);
                        assert.ok(!instance.started);
                    })
                    .end(done);

            });

            it('can disable job', function(done) {
                http.patch(`/api/jobs/${testJob2._id}`)
                    .send({
                        status: 'Disabled'
                    })
                    .expect(200)
                    .expect(function (res) {
                        var job = res.body;
                        assert.ok(job._id == testJob2._id);
                        assert.ok(job.status == 'Disabled');
                    })
                    .end(done);
            });

            it('cannot start instance for disabled job', function(done) {
                var agent = agents[0];

                http.post('/api/instances')
                    .send({
                        job: testJob2._id,
                        agent: agent._id
                    })
                    .expect(400)
                    .expect(function(res) {
                        debug(res.body.message);
                        assert.ok(res.body.name == 'JobDisabled')
                    })
                    .end(done);
            });

            it('cannot log messages from unstarted instance.', function(done) {

                http.post(`/api/instances/${lastInstance._id}/logs`)
                    .send({
                        logLevel: 'Info',
                        message: 'This is a test info message'
                    })
                    .expect(400)
                    .expect(function(res) {
                        debug(res.body.message);
                        assert.ok(res.body.name == 'InstanceNotStarted')
                    })
                    .end(done);

            });

            it('can be started', function(done) {
                http.put(`/api/instances/${lastInstance._id}/start`)
                    .expect(200)
                    .end(done);
            });

            it('cannot log messages without a log level.', function(done) {

                http.post(`/api/instances/${lastInstance._id}/logs`)
                    .send({
                        message: 'This is a test info message'
                    })
                    .expect(400)
                    .expect(function(res) {
                        debug(res.body.message);
                        assert.ok(res.body.name == 'InvalidLogLevel')
                    })
                    .end(done);

            });

            it('cannot log messages with an invalid log level.', function(done) {

                http.post(`/api/instances/${lastInstance._id}/logs`)
                    .send({
                        logLevel: 'BAD',
                        message: 'This is a test info message'
                    })
                    .expect(400)
                    .expect(function(res) {
                        debug(res.body.message);
                        assert.ok(res.body.name == 'InvalidLogLevel')
                    })
                    .end(done);

            });

            it('do not log if under minimum logging level for job.', function(done) {

                http.post(`/api/instances/${lastInstance._id}/logs`)
                    .send({
                        logLevel: 'Trace',
                        message: 'This is a test info message'
                    })
                    .expect(200)
                    .expect(function(res) {
                        debug(res.body.message);
                    })
                    .end(done);

            });

            it('log the message.', function(done) {

                http.post(`/api/instances/${lastInstance._id}/logs`)
                    .send({
                        logLevel: 'Info',
                        message: 'This is a test info message'
                    })
                    .expect(201)
                    .expect(function(res) {
                        debug(res.body.message);
                    })
                    .end(done);

            });

        });

    });
}

module.exports = testInstances;
