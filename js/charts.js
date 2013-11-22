var timeData = [],
	mouseDataCount = [],
	clicksCount = [],
	keypressesCount = [],
	speeds = [],
	categories = [],
	chart;

$(window).load(function() {

	chrome.storage.local.get(null, function(data) { 
		var t = data.tests;
		var count = 0;
		for (var i in t) {
			var taskTime = 0,
				mouseMovements = 0,
				clicks = 0,
				keypresses = 0,
				networkSpeed = 0;	
			
			var pages = 0;
			for (var j in i) {
				
				var goodData = typeof(t[i][j]) == 'undefined';
				
				var time = goodData ? 0 : t[i][j]["timeOnPage"];
				var mouse = goodData ? 0 : t[i][j]["mouseposition"].length;
				var k = goodData ? 0 : (typeof(t[i][j]["keypress"]) == 'undefined' ? 0 : t[i][j]["keypress"].length);
				var c = goodData ? 0 : (typeof(t[i][j]["click"]) == 'undefined' ? 0 : t[i][j]["click"].length);
				var n = goodData ? 0 : parseFloat(t[i][j]["networkSpeed"]);
			
				taskTime += time;
				mouseMovements += mouse;
				keypresses += k;
				clicks += c;
				console.log(c);
				
				if (!isNaN(n)) {
					networkSpeed += n;
					pages++;
				}
			}
			categories.push(i);
			timeData[count] = taskTime / 1000;
			mouseDataCount[count] = mouseMovements;
			keypressesCount[count] = keypresses;
			clicksCount[count] = clicks;
			speeds[count] = Math.round(networkSpeed / pages);
			
			count++;
		}
		
		chart.series[0].setData(timeData);
		chart.series[1].setData(mouseDataCount);
		chart.series[2].setData(clicksCount);
		chart.series[3].setData(keypressesCount);
		chart.series[4].setData(speeds);
	});

	
     chart =  $('#chart').highcharts({
            chart: {
                type: 'column'
            },
            title: {
                text: ''
            },
            xAxis: {
                categories: categories,
                title: {
                    text: null
                }
            },
            yAxis: {
                min: 1,
                title: {
                    text: 'Time On Task',
                    align: 'high'
                },
                labels: {
                    overflow: 'justify'
                },
				type: 'logarithmic'
            },
            plotOptions: {
                column: {
                    dataLabels: {
                        enabled: true
                    }
                }
            },
            credits: {
                enabled: false
            },
            series: [{
				name: 'Time on Site',
				data: []
			},{
				name: 'Mouse Movements',
				data: []
			},{
				name: 'Clicks',
				data: []
			},{
				name: 'Keypresses',
				data: []
			},{
				name: 'Free Network Speed',
				data: []
			}]
        }).highcharts();
	
});