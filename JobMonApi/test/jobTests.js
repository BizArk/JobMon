var assert = require('assert');

function testJobs(http) {
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
                        var job = res.body;
                        assert.ok(job._id);
                    })
                    .end(done);
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
                        var job = res.body;
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
                        var job = res.body;
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
                        var jobs = res.body;
                        assert.equal(3, jobs.length);
                    })
                    .end(done);
            });
        });
    });
}

module.exports = testJobs;
