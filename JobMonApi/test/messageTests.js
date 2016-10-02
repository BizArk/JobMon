var assert = require('assert');
var debug = require('debug')('jobmon.test.Instances')
var async = require('async');

function testMessages(http) {
    var instances;
    var inst1;

    describe('Messages', function () {

        before(function (done) {
            debug('getting instances.');
            http.get('/api/instances').expect(200).end(function (err, res) {
                instances = res.body;
            });
        });

    });
}

module.exports = testMessages;
