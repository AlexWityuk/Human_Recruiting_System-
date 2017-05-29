app.controller('MainController', ['$scope','$http','Service','localStorageService','$routeParams',
    function ($scope, $http, Service, localStorageService, $routeParams) {
    var page = $routeParams.page
    console.log("page: " + page);
    if(typeof page == "undefined") page = 1;
    $scope.pages = [];
    $http.get('/users/' + page)
        .success(function(data) {
            $scope.users = data.allUsers;
            localStorageService.set('userContactTypes', data.userContactTypes);
            localStorageService.set('userSkillNames', data.userSkillNames);
            $scope.count = parseInt(data.count);
            for (var i=0; i<Math.ceil($scope.count/20); i++){
                $scope.pages.push(i);
            }
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });
    $scope.deleteCompetitor = function(index) {
        if(confirm("Удалить соискателя?")){
            var id = $('input[name=deleteCompetitorId_' + index +']').val();
            $http.delete('/users/'+id)
                .success(function(response) {
                    window.location.reload();
                })
                .error(function(response) {
                    console.log('Error: ' + response);
                });
        }
    }
    $scope.serachCompetitor = function() {
        var data = {
            search: $scope.search
        };
        localStorageService.set('dataSearch', data);
    }
    $scope.pageActive = function(event){
        $(event.target).addClass('active');
    }
}]);
