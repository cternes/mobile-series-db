//load config file first, then bootstrap angular afterwards
$.getJSON('js/config/config.json', function (data) {
	apiVersion = data.apiVersion;
    apiKey = data.apiKey;
	clientSecret = data.clientSecret;
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

app.controller('SeriesController', function($scope, $http, $location) {
	// check if we already have an api token 
	$scope.hasApiToken = false;
	$scope.authorizationUrl = 'https://api-v2launch.trakt.tv/oauth/authorize?response_type=code&client_id=' + apiKey + '&redirect_uri=' + window.location.origin + window.location.pathname;
	
	debugger;
	var apiToken = localStorage.getItem("apiToken");
	
	// if we don't have an api token, set the authorizationUrl for the user to login
	if(apiToken !== null) {
		$scope.hasApiToken = true;
	}
	
	// if the code is sent back to us, retrieve api token with the code
	var code = getQueryVariable("code");
	if (code) {
		$http.post('https://api-v2launch.trakt.tv/oauth/token', 
			{'code': code, 'client_id': apiKey, 'client_secret': clientSecret, 'redirect_uri': window.location.origin + window.location.pathname, 'grant_type': 'authorization_code' }
		)
		.success(function(data) {
			$scope.hasApiToken = true;
			localStorage.setItem("apiToken", data.access_token);
			localStorage.setItem("apiRefreshToken", data.refresh_token);
		})
		.error(function(data, status) {		
			console.log('Could not get api token from server ('+status+').');
		});
	}
	
    $scope.$watch('online', function(newStatus) {
    });
    
    //if we're online, fetch fresh data from server and store in browser storage
    if ($scope.online && $scope.hasApiToken) {
		
		$http.get('https://api-v2launch.trakt.tv/users/' + username + '/watched/shows', { headers: {
			'Authorization': 'Bearer ' + apiToken,
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
			'Authorization': 'Bearer ' + apiToken,
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
	
	function getQueryVariable(variable) {
	  var query = window.location.search.substring(1);
	  var vars = query.split("&");
	  for (var i=0;i<vars.length;i++) {
		var pair = vars[i].split("=");
		if (pair[0] == variable) {
		  return pair[1];
		}
	  } 
	}
});