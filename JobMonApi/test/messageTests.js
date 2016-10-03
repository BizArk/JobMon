var assert = require('assert');
var debug = require('debug')('jobmon.test.Instances')
var async = require('async');

function testMessages(http) {
    var instances;
    var inst1;

    describe('Messages', function () {

        var runningInstances;

        before(function (done) {

            var query = {
                started: { $ne: null },
                completed: { $eq: null }
            };
            var qstr = JSON.stringify(query);
            debug(qstr);

            http.get('/api/instances')
                .query({ q: qstr, select: 'started completed' })
                .expect(200)
                .expect(function (res) {
                    var instances = runningInstances = res.body.data;
                    debug(res.body);
                    assert.ok(instances.length);
                    for (var i = 0; i < instances.length; i++) {
                        var inst = instances[i];
                        assert.ok(inst._id);
                        assert.ok(inst.started);
                        assert.ok(!inst.completed);
                    }
                })
                .end(done);

        });

        it('get all messages', function (done) {

            http.get('/api/messages')
                .expect(200)
                .expect(function (res) {
                    var messages = res.body.data;
                    //debug(messages);
                    assert.ok(messages.length);
                })
                .end(done);

        });

    });
}

module.exports = testMessages;
