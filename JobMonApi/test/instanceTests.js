var assert = require('assert');
var debug = require('debug')('jobmon.test.installs')
var async = require('async');

function testInstances(http) {
    var lastInstance;
    var jobs;
    var agents;

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

                var job = jobs[0];
                var agent = agents[0];

                http.post('/api/instances')
                    .send({
                        job: job._id,
                        agent: agent._id,
                        fileHash: 'abc123'
                    })
                    .expect(201)
                    .expect(function (res) {
                        var install = lastInstall = res.body;
                        assert.ok(install._id);
                    })
                    .end(done);

            });

            it('with required information 2', function (done) {

                var job = jobs[0];
                var agent = agents[0];

                http.post('/api/instances')
                    .send({
                        job: job._id,
                        agent: agent._id,
                        fileHash: 'abc123'
                    })
                    .expect(201)
                    .expect(function (res) {
                        var install = lastInstall = res.body;
                        assert.ok(install._id);
                    })
                    .end(done);

            });

            it('can be deleted', function (done) {
                http
                    .del(`/api/instances/${lastInstall._id}`)
                    .expect(204)
                    .end(done);
            });

            it('and install is deleted', function (done) {
                http
                    .get(`/api/instances/${lastInstall._id}`)
                    .expect(404)
                    .end(done);
            });

        });
    });
}

module.exports = testInstances;
