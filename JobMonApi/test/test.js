var assert = require('assert');
var request = require('request');

var rootUrl = 'http://localhost:8000/api';


function getStatusError(response) {
    if(response.statusCode >= 200 && response.statusCode < 300) return;
    return 'Status code is ' + response.statusCode;
}

before(function(done) {
    request.delete(rootUrl + '/admin/db', function(error, response, body) {
        done(error || getStatusError(response));
    });
});


describe('Agents', function() {
    describe('getting list of agents', function() {
        it('should return no agents', function(done) {
            request(rootUrl + '/agents', function(error, response, body) {
                error = error || getStatusError(response);
                if(!error) {
                    var agents = JSON.parse(body);
                    assert.equal(0, agents.length);
                } 
                done(error);
            });
        });
    });
});
/*

describe('Jobs', function() {
  describe('Get All Jobs', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal(-1, [1,2,3].indexOf(4));
    });
  });
});
*/
