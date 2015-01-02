// load up the distinct addresses


angular.module("Chart", ["ui.bootstrap"])
.controller("ChartController", function($scope) {
	$scope.l = 0;
	
	$scope.load = function() {
		console.log($scope.l);
		loadData(function(el) {
			return el.from == $scope.locations[$scope.l].from && el.to == $scope.locations[$scope.l].to
		})
	}
		
	$scope.getLocations = function() {
		database.init(function(s) {
		  server = s;
		  console.time("DB");
		  
		  // Load up the distinct times
		  server.times
		    .query("from")
		    .all()
		    .distinct()
		    .execute()
		    .then(function (locations) {
		       $scope.locations = locations;
		       $scope.$apply();
			  
		    });
		  
			loadData();
		  
		})
	}
	$scope.getLocations();
	
	$scope.loadDetails = function(e) {
		console.log(e);
		server.times.query("time")
			.filter(function(el) {
				console.log(e.x);
				return e.x - 5 < el.data[0] && e.x + 5 > el.data[0];
			})
			.execute()
			.then(function (results) {      
				$scope.results = results.slice(0,10);
				$scope.$apply();
			});  			 
		
		
	}
	
	window.$scope = $scope;
})
.filter("split", function() {
	return function(input) {
		return input.split(",")[0]
	}
})
.filter("timeDisplay", function() {
	return function(input) {
		if (!input) { return; }
		var pad = function(val) {
			return val >= 10 ? val : "0" + val;
		}
		return Math.floor(input / 60) + ":" + pad(Math.round(input % 1 * 60))
	}
})

window.chart = $('#chart').highcharts({

    chart: {
        type: 'heatmap',
        marginTop: 40,
        marginBottom: 40,
        zoomType:'xy',
        animation: {
            duration: 1500
        }
    },
    plotOptions: {
      heatmap: {
	      pointStart:-1
      }  
    },
    title: {
        text: 'Traffic Heatmap'
    },

    xAxis: {
       labels: {
           formatter: function() {
	           var val = this.value;
	           return secToTime(val);
           }
       },
       //min:300,
       //max:1200
       //min:0,
       //max:1440,
       startOnTick:false,
       endOnTick:false
    },

    yAxis: {
        categories: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday','Saturday','Sunday'],
        reversed:true,
        title: null,
        min:0,
        max:6,
        gridLineWidth:0,
    },

    colorAxis: {
         stops: [
            [0, '#3060cf'],
            [0.5, '#efe34f'],
            [0.8, '#d6463a'],
            [1, '#c4020a']
        ],
        labels: {
            formatter: function() {
	            return (this.value / 60).toFixed(2);
            }
        },
    },

    legend: {
        align: 'right',
        layout: 'vertical',
        margin: 0,
        verticalAlign: 'top',
        y: 22,
        symbolHeight: $("#chart").height() - 80,
    },

    tooltip: {
    	useHTML:true,
    	formatter: function() {
        	var sec = (this.point.value / 60 % 1 * .6).toFixed(2).split(".")[1];
        	var str = this.series.yAxis.categories[this.y]; 
        	str += " " + secToTime(this.point.x);
        	str += "<br/><b>" + Math.floor(this.point.value / 60) + ":" + sec + "</b>";
        	return str;
    	}

    },

    series: [{
        name: 'Traffic data',
        colsize:5,
        //data: data,
        data: [],
        turboThreshold:10000,
        events: {
	        click: function(e) {
		        $scope.loadDetails(e.point);
	        }
        },
        dataLabels: {
            enabled: false,
            color: 'black',
            rotation:90
        }
    }],
    credits: { enabled:false }

}).highcharts();



function loadData(filter) {
	filter = filter || function() { return true; };
	server.times.query("time")
  	  .filter(filter)
      .execute()
      .then(function (results) {      
          var data = results.map(function(el) { 
          	var d = new Date(el.date);   
          	if (el.data) { 
		    	return el.data;
		    } else {
			    return [(d.getHours() * 60 + d.getMinutes()), (d.getDay()-1), el.time]
		    }
		  });  
		  window.data = data;
		  console.timeEnd("DB");
          chart.series[0].setData(data);
          chrome.storage.local.set({ "svg": chart.container.innerHTML.split("<div")[0] })
         
      });
}



function secToTime(val) {
	return Math.floor(val / 60) % 12 + ":" + (val / 60 % 1 * .6).toFixed(2).split(".")[1] + (val < 720 ? "am" : "pm")
}





