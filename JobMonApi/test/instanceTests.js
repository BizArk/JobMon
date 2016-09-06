var assert = require('assert');

function testInstances(http) {
    describe('Instances', function () {
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
    });
}

module.exports = testInstances;
