var assert = require('assert');

function testJobs(http) {
    describe('Agents:', function () {
        describe('getting initial list of agents', function () {
            it('should return no agents', function (done) {
                http
                    .get('/api/agents')
                    .expect(200)
                    .expect(function (res) {
                        var agents = res.body.data;
                        assert.equal(0, agents.length);
                    })
                    .end(done);
            });
        });

        describe('register agent', function () {
            var agent01;

            it('without required information', function (done) {
                http
                    .post('/api/agents')
                    .expect(400)
                    .expect(function (res) {
                        var errs = res.body;
                        assert.equal('ValidationError', errs.name);
                    })
                    .end(done);
            });

            it('with all required information', function (done) {
                http
                    .post('/api/agents')
                    .send({
                        host: 'MyJobServer01',
                        hostDetails: 'Test Agent',
                        url: 'http://test',
                        enabled: true
                    })
                    .expect(201)
                    .expect(function (res) {
                        agent01 = res.body;
                        assert.ok(agent01._id);
                    })
                    .end(done);
            });

            it('with duplicate values', function (done) {
                http
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
                        assert.equal(agent._id, agent01._id);
                    })
                    .end(done);
            });

            it('with valid information', function (done) {
                http
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
                http
                    .get('/api/agents')
                    .expect(200)
                    .expect(function (res) {
                        var agents = res.body.data;
                        assert.equal(2, agents.length);
                    })
                    .end(done);
            });
        });

    });
};

module.exports = testJobs; 
