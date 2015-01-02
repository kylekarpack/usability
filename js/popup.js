angular.module("traffic", ["ui.bootstrap"])
.controller("UiController", function($scope, $http) {
	$scope.data = {};
	$scope.showSettings = false;
	database.init();
	
	$scope.init = function() {
		$http.get("http://www.bing.com/maps/directions.ashx?d=0~1&w=" + $scope.global.homeAddress + "~" + $scope.global.workAddress + "&mode=D")
			.success(function(d) {
				storeData(d);
				$scope.data = d.routeResults[0].routes[0].routeLegs[0].summary;		
			})
	}
		
	$scope.trafficScore = function() {
		var score = Math.round(($scope.data.timeWithTraffic / $scope.data.time - 1) * 100)
		return score;
	}
	
	$scope.getLocation = function(val) {
	    return $http.get('http://maps.googleapis.com/maps/api/geocode/json', {
	      params: {
	        address: val,
	        sensor: false
	      }
	    }).then(function(response){
	      return response.data.results.map(function(item){
	        return item.formatted_address;
	      });
	    });
	  };
	
	chrome.storage.local.get("svg", function(data) {
		$scope.svg = data.svg;
	});
	
	chrome.storage.sync.get("global", function(data) {
		console.log(data);
		$scope.global = data.global;
		$scope.init();
	})
	
	
	$scope.settings = function() {
		$scope.showSettings = !$scope.showSettings;
		if (!$scope.showSettings) {
			$scope.init();
			$scope.saved = true;
			setTimeout(function() {
				$scope.saved = false;
				$scope.$apply();
			},2000);
			chrome.storage.sync.set({ "global": $scope.global });
		}
		console.log($scope.showSettings);
	}
	
	$scope.trend = function() {
			
	}
	
	
	window.$scope = $scope;
})

.filter("timeDisplay", function() {
	return function(input) {
		if (!input) {
			return;
		}
	
		var pad = function(val) {
			return val >= 10 ? val : "0" + val;
		}
	
		return Math.floor(input) + ":" + pad(Math.round(input % 1 * 60))
	}
})

.filter("split", function() {
	return function(input) {
		input = input || "";
		return input.split(",")[0]
	}
})