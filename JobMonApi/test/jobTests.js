var assert = require('assert');
var debug = require('debug')('jobmon.test.jobs')

function binaryParser(res, callback) {
    res.setEncoding('binary');
    res.data = '';
    res.on('data', function (chunk) {
        res.data += chunk;
    });
    res.on('end', function () {
        callback(null, new Buffer(res.data, 'binary'));
    });
}

function testJobs(http) {
    var jobs; // we are going to be using the jobs once we create them.
    var lastJob; // Used to perform additional operations on the last job we were working on.

    describe('Jobs:', function () {
        describe('getting initial list of jobs', function () {
            it('should return no jobs', function (done) {
                http
                    .get('/api/jobs')
                    .expect(200)
                    .expect(function (res) {
                        var jobs = res.body.data;
                        assert.equal(0, jobs.length);
                    })
                    .end(done);
            });
        });

        describe('register job', function () {
            it('without install file', function (done) {
                http
                    .post('/api/jobs')
                    .expect(400)
                    .expect(function (res) {
                        var errs = res.body;
                        assert.equal('FileMissing', errs.name);
                    })
                    .end(done);
            });

            it('with valid install file', function (done) {
                http
                    .post('/api/jobs')
                    .attach('job', '.\\test\\testjob01.zip')
                    .expect(201)
                    .expect(function (res) {
                        lastJob = res.body;
                        debug(lastJob);
                    })
                    .end(done);
            });

            it('and file exists', function (done) {
                http
                    .get(`/downloads/jobs/${lastJob._id}.zip`)
                    .expect(200)
                    .parse(binaryParser)
                    .end(function (err, res) {
                        if (err)
                            return done(err);

                        assert.equal('application/zip', res.headers['content-type']);
                        assert.ok(Buffer.isBuffer(res.body));
                        done();
                    });
            });

            it('can be deleted', function (done) {
                http
                    .del(`/api/jobs/${lastJob._id}`)
                    .expect(204)
                    .end(done);
            });

            it('and job is deleted', function (done) {
                http
                    .get(`/api/jobs/${lastJob._id}`)
                    .expect(404)
                    .end(done);
            });

            it('and file is removed', function (done) {
                http
                    .get(`/downloads/jobs/${lastJob._id}.zip`)
                    .expect(404)
                    .end(done);
            });

            it('with same install file again', function (done) {
                http
                    .post('/api/jobs')
                    .attach('job', '.\\test\\testjob01.zip')
                    .expect(201)
                    .end(done);
            });

            it('can be updated', function (done) {
                http
                    .post('/api/jobs')
                    .attach('job', '.\\test\\testjob01b.zip')
                    .expect(200)
                    .end(done);
            });

            it('with a different name', function (done) {
                http
                    .post('/api/jobs')
                    .attach('job', '.\\test\\testjob02.zip')
                    .expect(201)
                    .end(done);
            });

            it('with a different name', function (done) {
                http
                    .post('/api/jobs')
                    .attach('job', '.\\test\\testjob03.zip')
                    .expect(201)
                    .end(done);
            });
        });

        describe('getting list of jobs', function () {
            it('should return 3 jobs', function (done) {
                http
                    .get('/api/jobs')
                    .expect(200)
                    .expect(function (res) {
                        jobs = res.body.data;
                        assert.equal(3, jobs.length);
                    })
                    .end(done);
            });
        });

        describe('downloading job', function () {
            it('should return the job', function (done) {
                http
                    .get(`/api/jobs/${jobs[0]._id}/download`)
                    .expect(function (res) {
                        console.log(res.body);
                    })
                    .end(done);
            });
        });
    });
}

module.exports = testJobs;
