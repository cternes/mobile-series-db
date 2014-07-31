//load config file first, then bootstrap angular afterwards
$.get('js/config/config.json', function (data) {
    apiKey = data.apiKey;
    username = data.username;
    
    angular.bootstrap(document, ['mobile-series-db']);
});

var app = angular.module('mobile-series-db', []);

app.run(function($window, $rootScope) {
    console.log("app run");
    
    //$scope.config = myConfig;
    
    //check if we're online/offline
    $rootScope.online = navigator.onLine;
    
    $window.addEventListener("offline", function() {
        $rootScope.$apply(function() {
            $rootScope.online = false;
        });
    }, false);
    
    $window.addEventListener("online", function() {
        $rootScope.$apply(function() {
            $rootScope.online = true;
        });
    }, false);
});

app.config(function() {
    console.log("app config");
});

app.controller('SeriesController', function($scope, $http) {
		
    $scope.$watch('online', function(newStatus) {
    });
    
    //if we're online, fetch fresh data from server and store in browser storage
    if ($scope.online) {
        //we need to use jsonp, since normal $http does not allow cross origin requests
        $http.jsonp('http://api.trakt.tv/user/library/shows/watched.json/' + apiKey + '/' + username + '?callback=JSON_CALLBACK') //callback=JSON_CALLBACK is for jsonp
                .success(function(data) {
                    $scope.seriesList = data;
                    localStorage.setItem("seriesJson", angular.toJson(data));
                })
                .error(function(data, status) {
                    console.log('Could not fetch data from server ('+status+'). Have you set your api key in /js/config/config.js?');
                });
    }
    //if we're offline, fetch data from browser storage
    else {
        $scope.seriesList = angular.fromJson(localStorage.getItem("seriesJson"));
    }
});