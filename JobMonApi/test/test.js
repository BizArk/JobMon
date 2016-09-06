var assert = require('assert');
var request = require('supertest');
var app = require('../app.js');
var agent = request(app);

before(function(done) {
    agent
        .delete('/api/admin/db')
        .expect(204)
        .end(done);
});

describe('Agents', function() {
    describe('getting initial list of agents', function() {
        it('should return no agents', function(done) {
            agent
                .get('/api/agents')
                .expect(200)
                .expect(function(res) {
                    var agents = res.body;
                    assert.equal(0, agents.length);
                })
                .end(done);
        });
    });

    describe('registering agent', function() {
        it('without required information', function(done) {
            agent
                .post('/api/agents')
                .expect(400)
                .expect(function(res) {
                    var errs = res.body;
                    assert.equal('agent validation failed', errs.message);
                })
                .end(done);
        });

        it('with all required information', function(done) {
            agent
                .post('/api/agents')
                .send({
                    host: 'MyJobServer01',
                    hostDetails: 'Test Agent',
                    url: 'http://test',
                    enabled: true
                })
                .expect(201)
                .expect(function(res) {
                    var agent = res.body;
                    assert.ok(agent._id);
                })
                .end(done);
        });

        it('same agent twice', function(done) {
            agent
                .post('/api/agents')
                .send({
                    host: 'MyJobServer01',
                    hostDetails: 'Test Agent',
                    url: 'http://test01'
                })
                .expect(200)
                .expect(function(res) {
                    var agent = res.body;
                    assert.ok(agent._id);
                })
                .end(done);
        });

        it('another agent', function(done) {
            agent
                .post('/api/agents')
                .send({
                    host: 'MyJobServer02',
                    hostDetails: 'Test Agent',
                    url: 'http://test02',
                    enabled: true
                })
                .expect(201)
                .expect(function(res) {
                    var agent = res.body;
                    assert.ok(agent._id);
                })
                .end(done);
        });
    });
});

/*
describe('Jobs', function() {
    describe('getting list of jobs', function() {
        it('should return no jobs', function(done) {
            request(rootUrl + '/jobs', function(error, response, body) {
                error = error || getStatusError(response);
                if(!error) {
                    var jobs = JSON.parse(body);
                    assert.equal(0, jobs.length);
                } 
                done(error);
            });
        });
    });
});


describe('Instances', function() {
    describe('getting list of instances', function() {
        it('should return no instances', function(done) {
            request(rootUrl + '/instances', function(error, response, body) {
                error = error || getStatusError(response);
                if(!error) {
                    var instances = JSON.parse(body);
                    assert.equal(0, instances.length);
                } 
                done(error);
            });
        });
    });
});
*/
