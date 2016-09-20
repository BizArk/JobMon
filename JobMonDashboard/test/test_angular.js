describe("JobMon Angular services test", function () {
    var bob = null;

    beforeEach(function () {
        module('main');
    });

    it("should just work", function () {
        var app = angular.module('main');
        app.controller('')
        expect(app).not.toBeNull();
    })

});
