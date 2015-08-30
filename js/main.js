//load config file first, then bootstrap angular afterwards
$.getJSON('js/config/config.json', function (data) {
	apiVersion = data.apiVersion;
    apiKey = data.apiKey;
    username = data.username;
    
    angular.bootstrap(document, ['mobile-series-db']);
});

var app = angular.module('mobile-series-db', []);

app.run(function($window, $rootScope) {
    console.log("app run");
    
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
	var apiToken = '';
	
    $scope.$watch('online', function(newStatus) {
    });
    
    //if we're online, fetch fresh data from server and store in browser storage
    if ($scope.online) {
		
		$http.get('https://api-v2launch.trakt.tv/users/' + username + '/watched/shows', { headers: {
			'Authorization': apiToken,
			'trakt-api-version': apiVersion,
			'trakt-api-key': apiKey
			}
		})
		.success(function(data) {
			$scope.seriesList = data;
			angular.forEach($scope.seriesList, function(value, key) {
			   getSeriesProgress(value, data);
			});

			localStorage.setItem("seriesJson", angular.toJson($scope.seriesList));
		})
		.error(function(data, status) {
			console.log('Could not fetch data from server ('+status+'). Have you set your api key in /js/config/config.js?');
		});
    }
    //if we're offline, fetch data from browser storage
    else {
        $scope.seriesList = angular.fromJson(localStorage.getItem("seriesJson"));
    }
    
	function getSeriesProgress(series, seriesList) {
		var id = series.show.ids.trakt;
		
		$http.get('https://api-v2launch.trakt.tv/shows/' + id + '/progress/watched', { headers: {
			'Authorization': apiToken,
			'trakt-api-version': apiVersion,
			'trakt-api-key': apiKey
			}
		})
		.success(function(data) {
			var remainingEpisodesToWatch = data.aired - data.completed;
			
			//if fully watched, set style class
			if(remainingEpisodesToWatch === 0) {
				series.styleClass = 'light-red'
			}
			
			//if has next episode, get season
			if(data.next_episode !== null) {
				series.nextSeason = data.next_episode.season;
			}
			
			// store
			localStorage.setItem("seriesJson", angular.toJson($scope.seriesList));
		})
		.error(function(data, status) {
			console.log('Could not fetch data from server ('+status+'). Have you set your api key in /js/config/config.js?');
		});
	}
});