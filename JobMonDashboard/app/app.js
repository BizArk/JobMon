var app = angular.module('main', [])

app.controller('jobsController', ['$scope', '$http', '$interval',
    function JobsController($scope, $http, $interval) {

        getJobs();
        //once a minute.
        $interval(getJobs, 60 * 1000);

        function getJobs() {

            $http.get('/api/jobs/').then(function success(response) {

                for (var i = 0; i < response.data.length; i++) {

                    //temp stub until we get the instances.
                    response.data[i].instanceCount = 0;
                }
                $scope.jobList = response.data;

                getInstances();
            },
            function error(response) {
                alert(response.data);
            });
        }

        function getInstances() {
            $http.get('/api/instances/').then(function success(response) {
                $scope.jobInstances = response.data;
 
            },
            function error(response) {
                alert(response.data);
            });
        }

    }]);
