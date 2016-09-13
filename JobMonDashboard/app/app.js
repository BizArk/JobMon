var app = angular.module('main', [])

(function () {

    app.controller('jobsController', ['$scope', '$http', function JobsController($scope, $http) {

        getJobs();


       var getJobs = function getJobs() {

            $http.get('/api/jobs/').then(function success(response) {

                for (var i = 0; i < response.data.length; i++) {

                    //temp stub until we get the instances.
                    response.data[i].instanceCount = 0;
                }
                $scope.jobList = response.data;

                console.log($scope.jobList);
                getInstances();
            },
            function error(response) {
                alert(response.data);
            });
        }

       var getInstances = function getInstances() {
            $http.get('/api/instances/').then(function success(response) {
                $scope.jobInstances = response.data;
                console.log("got instances");
                console.log(response.data);
            },
            function error(response) {
                alert(response.data);
            });
        }

    }]);
})()