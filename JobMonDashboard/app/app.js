var app = angular.module('main', [])


app.controller('jobsController', ['$scope', '$http', '$interval',
    function JobsController($scope, $http, $interval) {

        getJobs();
        //update once a minute.
        var intervalPromise =  $interval(getJobs, 60 * 1000);

        function getJobs() {

            $http.get('/api/jobs/').then(function success(response) {

                for (var i = 0; i < response.data.length; i++) {

                    //temp stub until we get the instances.
                    response.data[i].instanceCount = 0;
                }
                $scope.jobList = response.data;

                getInstances().then(countInstances);
            },
            function error(response) {
                $interval.cancel(intervalPromise);
                alert(response.data);
            });
        }

        function countInstances() {
            //after we fetch the jobs, we need to get a count of the instances
            var jobsWithInstances = [];
            for (var i = 0; i < $scope.jobInstances.length; i++) {
                var instance = $scope.jobInstances[i];
                if (!(instance.stop || instance.completed))
                    jobsWithInstances.push(instance.jobID);
            }
            var countJobs = JMUtil.countUnique(jobsWithInstances);

            for (var j = 0; j < $scope.jobList.length; j++) {
                var job = $scope.jobList[j];
                if (countJobs[job._id])
                    job.instanceCount = countJobs[job._id];

            }
        }
        function getInstances() {
           return $http.get('/api/instances/').then(function success(response) {
               $scope.jobInstances = response.data;
               return response.data;
            },
            function error(response) {
                alert(response.data);
            });
        }

    }]);
