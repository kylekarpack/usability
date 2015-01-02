var database = {},
	server;


database.init = function(callback) {
	db.open({
	  server: 'traffalytics',
	  version: 2,
	  schema: {
	      times: {
	          key: { keyPath: 'id' , autoIncrement: true },
	          // Optionally add indexes
	          indexes: {
	              date: { },
	              time: { },
	              data: { },
	              actualTime: { },
	              from: { },
	              to: { }     
	          }
	      }
	  }
	}).then( function ( s ) {
		if (callback) {
			callback(s);
		} else {
			server = s;
		}
		
	});
}


function storeData(d) {
	var time = d.routeResults[0].routes[0].routeLegs[0].summary.timeWithTraffic,
		expected = d.routeResults[0].routes[0].routeLegs[0].summary.time,
		timeInMinutes = (time / 60).toFixed(0),
		date = new Date(),
		timestamp = (date).getTime(),
		data = [(date.getHours() * 60 + date.getMinutes()), (date.getDay()-1), time]
	
	server.times.add({
		date: timestamp,
		data: data,
		time: time,
		actualTime: null,
		from: d.homeAddress,
		to: d.workAddress
	
	}).then(function() {
		console.log("Time saved");
		
		// Only do this if possible
		if (chrome.browserAction) {
			var n = Math.min((1 - Math.abs(((Math.min(time / expected, 2) - 1)))) / 3, (1/3)),
			c = HSVtoRGB(n,1,.75),
			color = [c.r, c.g, c.b, 255];
			//var color = [R,G,B,255];
			chrome.browserAction.setBadgeBackgroundColor({"color": color});
			chrome.browserAction.setBadgeText({text: timeInMinutes });	
		} else {
			console.log("Can't update from here");
		}

		
		
	})
}