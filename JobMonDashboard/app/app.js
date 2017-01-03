var app = angular.module('main', [])


app.controller('jobsController', ['$scope', '$http', '$interval',
    function JobsController($scope, $http, $interval) {

        var jobs;
        var instances;

        //update once a minute.
        var intervalPromise =  $interval(getJobs, 60 * 1000);

        getJobs();

        function getJobs() {

            $http.get('/api/jobs/').then(function success(response) {
                $scope.jobList = jobs = response.data.data;
                for (var i = 0; i < jobs.length; i++) {

                    //temp stub until we get the instances.
                    jobs[i].instanceCount = 0;
                }

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
               $scope.jobInstances = instances = response.data.data;
               return response.data;
            },
            function error(response) {
                alert(response.data);
            });
        }

    }]);
