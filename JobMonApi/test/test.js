var assert = require('assert');
var request = require('supertest');
var app = require('../app.js');
var agent = request(app);

before(function (done) {
    agent
        .delete('/api/admin/db')
        .expect(204)
        .end(done);
});

describe('Agents:', function () {
    describe('getting initial list of agents', function () {
        it('should return no agents', function (done) {
            agent
                .get('/api/agents')
                .expect(200)
                .expect(function (res) {
                    var agents = res.body;
                    assert.equal(0, agents.length);
                })
                .end(done);
        });
    });

    describe('register agent', function () {
        it('without required information', function (done) {
            agent
                .post('/api/agents')
                .expect(400)
                .expect(function (res) {
                    var errs = res.body;
                    assert.equal('ValidationError', errs.name);
                })
                .end(done);
        });

        it('with all required information', function (done) {
            agent
                .post('/api/agents')
                .send({
                    host: 'MyJobServer01',
                    hostDetails: 'Test Agent',
                    url: 'http://test',
                    enabled: true
                })
                .expect(201)
                .expect(function (res) {
                    var agent = res.body;
                    assert.ok(agent._id);
                })
                .end(done);
        });

        it('with duplicate values', function (done) {
            agent
                .post('/api/agents')
                .send({
                    host: 'MyJobServer01',
                    hostDetails: 'Test Agent',
                    url: 'http://test01'
                })
                .expect(200)
                .expect(function (res) {
                    var agent = res.body;
                    assert.ok(agent._id);
                })
                .end(done);
        });

        it('with valid information', function (done) {
            agent
                .post('/api/agents')
                .send({
                    host: 'MyJobServer02',
                    hostDetails: 'Test Agent',
                    url: 'http://test02',
                    enabled: true
                })
                .expect(201)
                .expect(function (res) {
                    var agent = res.body;
                    assert.ok(agent._id);
                })
                .end(done);
        });
    });

    describe('getting list of agents', function () {
        it('should return 2 agents', function (done) {
            agent
                .get('/api/agents')
                .expect(200)
                .expect(function (res) {
                    var agents = res.body;
                    assert.equal(2, agents.length);
                })
                .end(done);
        });
    });

});


describe('Jobs:', function () {
    describe('getting initial list of jobs', function () {
        it('should return no jobs', function (done) {
            agent
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
            agent
                .post('/api/jobs')
                .expect(400)
                .expect(function (res) {
                    var errs = res.body;
                    assert.equal('ValidationError', errs.name);
                })
                .end(done);
        });

        it('with required information', function (done) {
            agent
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
                    var agent = res.body;
                    assert.ok(agent._id);
                })
                .end(done);
        });

        it('with duplicate information', function (done) {
            agent
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
            agent
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
                    var agent = res.body;
                    assert.ok(agent._id);
                })
                .end(done);
        });

        it('with valid information', function (done) {
            agent
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
                    var agent = res.body;
                    assert.ok(agent._id);
                })
                .end(done);
        });
    });

    describe('getting list of jobs', function () {
        it('should return 3 jobs', function (done) {
            agent
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


describe('Instances', function () {
    describe('getting list of instances', function () {
        it('should return no instances', function (done) {
            agent
                .get('/api/instances')
                .expect(200)
                .expect(function (res) {
                    var instances = res.body;
                    assert.equal(0, instances.length);
                })
                .end(done);
        });
    });
});
