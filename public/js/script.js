var app = angular.module("myApp", ["ngRoute", "LocalStorageModule"]);
app.config(function($routeProvider, $locationProvider){
    $routeProvider
        .when('/', {
        templateUrl: '/home.html',
        controller: 'MainController'
        })
        .when('/users/:page', {
            templateUrl: '/home.html',
            controller: 'MainController'
        })
        .when('/search/users', {
            templateUrl: '/home.html',
            controller: 'searchController'
        })
        .when('/user/:userId', {
            templateUrl: '/update.html',
            controller: 'updateController'
        })
        .otherwise({redirectTo: '/'});
    // enable HTML5mode to disable hashbang urls
    /*$locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });*/
});
app.controller('createController', ['$scope','$http', 'localStorageService','$location',
    function ($scope, $http, localStorageService, $location) {
        $scope.datauser = {};
        $scope.datauser.contacts = [];
        $scope.datauser.skillname = [];
        $scope.userContactTypes = localStorageService.get('userContactTypes');
        $scope.userSkillNames = localStorageService.get('userSkillNames');
        $scope.regex = /^[a-zA-Z0-9а-яА-Я]*$/;
        $scope.modelSelectSkillNames=$scope.userSkillNames[0];
        $scope.modelForm = {
            Nameupdate: "",
            Familyupdate: "",
            contacts: [],
            skillname: []
        };
    $scope.itr_contacts = 0;
    $scope.itr_skillname = 0
    $scope.createCompetitor = function(){
        angular.element('#overlay').css('display','block');
    }
    $scope.addContact = function(){
        var type = angular.element('#select_type_contact').val();
        $scope.datauser.contacts.push(['', type,'']);
        $scope.modelForm.contacts[$scope.itr_contacts] = ['', type,''];
        $scope.itr_contacts++;
    }
    $scope.deletContact = function(index){
        if ($scope.datauser.contacts[index][0].length == 0){
            this.datauser.contacts.splice(index, 1);
            $scope.itr_contacts--;
        }
    }
    $scope.addSkill = function(){
        $scope.datauser.skillname.push(["", this.modelSelectSkillNames.skillnames,""]);
        $scope.modelForm.skillname[$scope.itr_skillname] = ["", this.modelSelectSkillNames.skillnames,""]
        $scope.itr_skillname++;
    }
    $scope.deletSkill = function(index){
        if ($scope.datauser.skillname[index][0].length === 0){
            this.datauser.skillname.splice(index, 1);
            $scope.itr_skillname--;
        }
    }
    /********Add Competitior***************/
    $scope.submitForm = function(){
        var id = $('input[name=userid]').val();
        id = parseInt(id);
        console.log($scope.modelForm);
        $http({
            method  : 'POST',
            url     : '/users',
            data:  this.modelForm,
            headers : { 'Content-Type': 'application/json' }
        })
            .success(function(data, status) {
                alert('Соискатель добавлен успешно.');
                angular.element('#overlay').css('display','none');
                //$location.path('/home.html');
                window.location.reload();
            })
            .error(function(data){
                console.log('Error: ' + data);
            });
    }
    $scope.Redirect_to_home = function(){
        angular.element('#overlay').css('display','none');
    }
}]);
app.controller('searchController', ['$scope','$http','$location','Service','localStorageService',
    function ($scope, $http, $location, Service, localStorageService) {
    //var data = Service.getDataSearch();
    var data = localStorageService.get('dataSearch');
    console.log(data);
    $http({
            method  : 'POST',
            url     : '/search/users',
            data:  data,
            headers : { 'Content-Type': 'application/json' }
        })
        .success(function(data, status) {
            console.log(data);
            $scope.users = data;
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });
    $scope.serachCompetitor = function() {
        var data = {
            search: $scope.search
        };
        localStorageService.remove('dataSearch');
        localStorageService.set('dataSearch', data);
        window.location.reload();
    }
}]);
/*************MainController******************************/
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
/************End MainController***************************/
/*******updateController******************************/
app.controller('updateController', ['$scope','$http','$routeParams','$location',
    function ($scope, $http, $routeParams, $location) {

    var id = $routeParams.userId;

    id = parseInt(id);

    $http.get('/user/'+id)
        .success(function(result){
            $scope.datauser = result.user;
            $scope.userContactTypes = result.userContactTypes;
            $scope.userSkillNames = result.userSkillNames;
            $scope.regex = /^[a-zA-Z0-9а-яА-Я]*$/;
            $scope.modelSelectSkillNames=$scope.userSkillNames[1];
            for (i = 0; i < $scope.datauser.skillname.length; i++) {
                $scope.datauser.skillname[i][2] = parseInt($scope.datauser.skillname[i][2]);
                console.log(typeof $scope.datauser.skillname[i][2]);
            }
            $scope.modelForm = {
                Nameupdate: $scope.datauser.fio[0],
                Familyupdate: $scope.datauser.fio[1],
                contacts: $scope.datauser.contacts,
                skillname: $scope.datauser.skillname
            };
        })
        .error(function(response){
            console.log('Error: ' + forSingleUser);
        });
    $scope.submitForm = function(){
        var id = $('input[name=userid]').val();
        id = parseInt(id);
        console.log($scope.modelForm);
        $http({
            method  : 'PUT',
            url     : '/users/'+ id,
            data:  this.modelForm,
            headers : { 'Content-Type': 'application/json' }
            })
            .success(function(data, status) {
                alert('Обновление успешно завершено.');
                $location.path('/home.html');
            })
            .error(function(data){
                console.log('Error: ' + data);
            });
    }
        $scope.addContact = function(){
            var type = angular.element('#select_type_contact').val();
            $scope.datauser.contacts.push(['', type,'']);
        }
        $scope.deletContact = function(index){
            if ($scope.datauser.contacts[index][0].length == 0){
                this.datauser.contacts.splice(index, 1);
            }
        }
        $scope.addSkill = function(){
            $scope.datauser.skillname.push(['', this.modelSelectSkillNames.skillnames,'']);
        }
        $scope.deletSkill = function(index){
            if ($scope.datauser.skillname[index][0].length === 0){
                this.datauser.skillname.splice(index, 1);
            }
        }
}]);
app.service('Service', function() {
    /*var dataSearch;

    var addDataSearch = function(newObj) {
        dataSearch = newObj;
    };
    var getDataSearch = function (){
        return dataSearch;
    }

    return {
        addDataSearch: addDataSearch,
        getDataSearch: getDataSearch
    };*/
});