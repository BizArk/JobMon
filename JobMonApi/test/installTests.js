var assert = require('assert');
var debug = require('debug')('jobmon.test.installs')
var async = require('async');

function testInstalls(http) {
    var lastInstall; // Used to perform additional operations on the last install we were working on.
    var jobs;
    var agents;

    describe('Installs:', function () {
        describe('getting initial list of installs', function () {
            it('should return no installs', function (done) {
                http
                    .get('/api/installs')
                    .expect(200)
                    .expect(function (res) {
                        var installs = res.body;
                        assert.equal(0, installs.length);
                    })
                    .end(done);
            });
        });

        describe('install job', function () {
            it('without required information', function (done) {
                http
                    .post('/api/installs')
                    .expect(400)
                    .expect(function (res) {
                        var errs = res.body;
                        assert.equal('ValidationError', errs.name);
                    })
                    .end(done);
            });

            it('with invalid IDs', function (done) {
                http
                    .post('/api/installs')
                    .send({
                        agentID: '123',
                        jobID: 'abc'
                    })
                    .expect(400)
                    .expect(function (res) {
                        var errs = res.body;
                        assert.equal('ValidationError', errs.name);
                    })
                    .end(done);
            });

            it('with required information', function (done) {

                async.series([
                    function (fn) { http.get('/api/jobs').expect(200).end(function (err, res) { fn(null, res.body); }); },
                    function (fn) { http.get('/api/agents').expect(200).end(function (err, res) { fn(null, res.body); }); },
                ], function (err, results) {
                    if (err) {
                        debug(err);
                        done();
                        return;
                    }

                    jobs = results[0];
                    agents = results[1];

                    var job = jobs[0];
                    var agent = agents[0];

                    http.post('/api/installs')
                        .send({
                            jobID: job._id,
                            agentID: agent._id
                        })
                        .expect(201)
                        .expect(function (res) {
                            var install = lastInstall = res.body;
                            assert.ok(install._id);
                        })
                        .end(done);
                });

            });

            it('can be deleted', function (done) {
                http
                    .del(`/api/installs/${lastInstall._id}`)
                    .expect(204)
                    .end(done);
            });

            it('and install is deleted', function (done) {
                http
                    .get(`/api/installs/${lastInstall._id}`)
                    .expect(404)
                    .end(done);
            });

            it('with required information again', function (done) {
                var job = jobs.find(function (job) { return job.fileHash; });
                var agent = agents[0];

                http.post('/api/installs')
                    .send({
                        jobID: job._id,
                        agentID: agent._id
                    })
                    .expect(201)
                    .expect(function (res) {
                        var install = lastInstall = res.body;
                        assert.ok(install._id);
                    })
                    .end(done);
            });

            it('with duplicate information', function (done) {
                var job = jobs.find(function (job) { return job.fileHash; });
                var agent = agents[0];

                http.post('/api/installs')
                    .send({
                        jobID: job._id,
                        agentID: agent._id
                    })
                    .expect(400)
                    .expect(function (res) {
                        var errs = res.body;
                        assert.equal('MongoDB', errs.name);
                        assert.equal('11000', errs.code);
                    })
                    .end(done);
            });

            it('with valid information', function (done) {
                var job = jobs.find(function (job) { return job.fileHash; });
                var agent = agents[1];

                http.post('/api/installs')
                    .send({
                        jobID: job._id,
                        agentID: agent._id
                    })
                    .expect(201)
                    .expect(function (res) {
                        var install = lastInstall = res.body;
                        assert.ok(install._id);
                    })
                    .end(done);
            });

            it('with job with no file', function (done) {
                var job = jobs.find(function (job) { return !job.fileHash; });
                var agent = agents[1];

                http.post('/api/installs')
                    .send({
                        jobID: job._id,
                        agentID: agent._id
                    })
                    .expect(400)
                    .expect(function (res) {
                        var errs = res.body;
                        assert.equal('InvalidJob', errs.name);
                    })
                    .end(done);
            });

            describe('getting list of installs', function () {
                it('should return 2 installs', function (done) {
                    http
                        .get('/api/installs')
                        .expect(200)
                        .expect(function (res) {
                            jobs = res.body;
                            assert.equal(2, jobs.length);
                        })
                        .end(done);
                });
            });

        });
    });
}

module.exports = testInstalls;
