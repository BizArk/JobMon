var assert = require('assert');

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
                        var jobs = res.body;
                        assert.equal(0, jobs.length);
                    })
                    .end(done);
            });
        });

        describe('register job', function () {
            it('without required information', function (done) {
                http
                    .post('/api/jobs')
                    .expect(400)
                    .expect(function (res) {
                        var errs = res.body;
                        assert.equal('ValidationError', errs.name);
                    })
                    .end(done);
            });

            it('with required information', function (done) {
                http
                    .post('/api/jobs')
                    .send({
                        displayName: 'Test Job',
                        description: 'A fake job for testing purposes.',
                        status: 'Enabled',
                        configuration: null,
                        minLogLevel: 'Info',
                        numberOfInstances: 1
                    })
                    .expect(201)
                    .expect(function (res) {
                        var job = lastJob = res.body;
                        assert.ok(job._id);
                    })
                    .end(done);
            });

            it('and upload file', function (done) {
                http
                    .post(`/api/jobs/${lastJob._id}/upload`)
                    .attach('job', '.\\test\\testjob.zip')
                    .expect(201)
                    .end(done);
            });

            it('and file exists', function (done) {
                http
                    .get(`/downloads/jobs/${lastJob._id}.zip`)
                    .expect(200)
                    .parse(binaryParser)
                    .end(function(err, res) {
                        if(err)
                            return done(err);
                        
                        assert.equal('application/zip', res.headers['content-type']);
                        assert.ok(Buffer.isBuffer(res.body));
                        console.log(res.body);
                        done();
                    });
            });

            it('with duplicate information', function (done) {
                http
                    .post('/api/jobs')
                    .send({
                        displayName: 'Test Job',
                        description: 'A fake job for testing purposes.',
                        status: 'Enabled',
                        configuration: null,
                        minLogLevel: 'Info',
                        numberOfInstances: 1
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
                http
                    .post('/api/jobs')
                    .send({
                        displayName: 'Another Test Job',
                        description: 'A fake job for testing purposes.',
                        status: 'Enabled',
                        configuration: null,
                        minLogLevel: 'Info',
                        numberOfInstances: 1
                    })
                    .expect(201)
                    .expect(function (res) {
                        var job = lastJob = res.body;
                        assert.ok(job._id);
                    })
                    .end(done);
            });

            it('with valid information', function (done) {
                http
                    .post('/api/jobs')
                    .send({
                        displayName: 'Fake Job',
                        description: 'A fake job for testing purposes.',
                        status: 'Enabled',
                        configuration: null,
                        minLogLevel: 'Info',
                        numberOfInstances: 1
                    })
                    .expect(201)
                    .expect(function (res) {
                        var job = lastJob = res.body;
                        assert.ok(job._id);
                    })
                    .end(done);
            });
        });

        describe('getting list of jobs', function () {
            it('should return 3 jobs', function (done) {
                http
                    .get('/api/jobs')
                    .expect(200)
                    .expect(function (res) {
                        jobs = res.body;
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

        describe('installing job', function () {
            var agents;

            before(function (done) {
                http
                    .get('/api/agents')
                    .expect(200)
                    .expect(function (res) {
                        agents = res.body;
                    })
                    .end(done);
            });


            it('with valid job ID', function (done) {
                http
                    .post(`/api/agents/${agents[0]._id}/jobs`)
                    .send({ jobID: jobs[0]._id })
                    .expect(function (res) {
                        console.log(res.body);
                    })
                    .expect(201)
                    .end(done);
            });

            it('has been installed with version', function (done) {
                console.log('version: ' + job.version);
                done();
            });
        });
    });
}

module.exports = testJobs;
