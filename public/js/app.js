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