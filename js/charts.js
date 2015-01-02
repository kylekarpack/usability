var timeData = [],
	mouseDataCount = [],
	clicksCount = [],
	keypressesCount = [],
	pagesCount = [],
	speeds = [],
	
	categories = [],
	chart;

$(window).load(function() {
	

	// UI Stuff
	$("#log").click(function() {
		chart.yAxis[0].isLog = !(chart.yAxis[0].isLog);
		chart.redraw();
	});


	// Sorry this is a mess...
	chrome.storage.local.get(null, function(data) { 
		var t = data.tests;
		var count = 0;
		for (var i in t) {
			var taskTime = 0,
				mouseMovements = 0,
				clicks = 0,
				keypresses = 0,
				networkSpeed = 0;	
			
			var pages = 0,
				pageTitlesSet = new Set();
			for (var j in i) {					
				
				var goodData = typeof(t[i][j]) != 'undefined',
					time,
					mouse,
					k,
					c,
					n;
				
				if (goodData) {
					time =  t[i][j]["timeOnPage"];
					mouse = t[i][j]["mouseposition"].length;
					k = (typeof(t[i][j]["keypress"]) == 'undefined' ? 0 : t[i][j]["keypress"].length);
					c = (typeof(t[i][j]["click"]) == 'undefined' ? 0 : t[i][j]["click"].length);
					n =  parseFloat(t[i][j]["networkSpeed"]);
					pageTitlesSet.add(t[i][j]["title"]);
					
					taskTime += time;
					mouseMovements += mouse;
					keypresses += k;
					clicks += c;
					
					if (!isNaN(n)) {
						networkSpeed += n;
						pages++;
					}
				}
			}
			categories.push(i);
			timeData[count] = Math.round(taskTime / 1000);
			mouseDataCount[count] = mouseMovements;
			keypressesCount[count] = keypresses;
			clicksCount[count] = clicks;
			pagesCount[count] = pageTitlesSet.size;
			speeds[count] = Math.round(networkSpeed / pages);
			
			count++;
		}
		
		chart.series[0].setData(timeData);
		chart.series[1].setData(mouseDataCount);
		chart.series[2].setData(clicksCount);
		chart.series[3].setData(keypressesCount);
		chart.series[4].setData(pagesCount);
		chart.series[5].setData(speeds);
	});

	Highcharts.getOptions().colors = Highcharts.map(Highcharts.getOptions().colors, function(color) {
		return {
			radialGradient: { cx: 0.5, cy: 0.3, r: 0.7 },
			stops: [
				[0, color],
				[1, Highcharts.Color(color).brighten(-0.2).get('rgb')] // darken
			]
		};
	});
	
     chart = $('#chart').highcharts({
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
                labels: {
                    overflow: 'justify'
                },
				type: 'logarithmic'
            },
            plotOptions: {
                column: {
                    dataLabels: {
                        enabled: true
                    },
					groupPadding:0.1,
					pointPadding:0.05
                }
            },
            credits: {
                enabled: false
            },
            series: [{
				name: 'Time on Task',
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
				name: 'Pages Visited',
				data: []
			},{
				name: 'Free Network Speed',
				data: []
			}]
        }).highcharts();
	
});