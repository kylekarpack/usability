function get() {
	chrome.storage.local.get(null, function(items) {
		if (items.status == "running") {
			startHandler();
		} else {
			stopHandler();
		}
		
		var limit = 10
		var b = Object.keys(items); // todo: most recent first
		for (var a in b) {
			if (b[a].indexOf("usability|") == 0 && a < limit) { // Limit to most recent 10
				var obj = JSON.parse(items[b[a]]);
				
				var truncTitle = obj.title.substring(0,60).length < obj.title.length ? obj.title.substring(0,60) + "..." : obj.title;
				var button = 
				
				$("ul.list").append("<li><a href='" + obj.url + "'>" + truncTitle + "</a><br /><small>" +
					"Mouse: " + obj.mouseposition.length + " | " +
					"Clicks: " + obj.click.length + " | " +
					"Keys: " + obj.keypress.length +
					
					"</small></li>");
			}
		}
	});
}

function start() {
	chrome.storage.local.set({"status":"running"}, function() {
		startHandler();
	});
}

function stop() {
	chrome.storage.local.set({"status":"stopped"}, function() {
		stopHandler();
	});
}

function startHandler() {
	$("#test").removeClass("start").text("Stop Test");
	chrome.browserAction.setBadgeText({text:"Live"});
}

function stopHandler() {
	$("#test").addClass("start").text("Start Test");
	chrome.browserAction.setBadgeText({text:""});
}




$(window).load(function() {
	
	// Start/stop handler
	$("#test").click(function() {
		$(this).hasClass("start") ? start() : stop();
	});
	
	// Close handler
	$(".close").click(function() {
		window.close();
	});
	
	get();
	
	
	function drawHeatmap() {
		
		var retrievedObject = localStorage.getItem("usability|http://www.karpack.us/contact");
		var a = JSON.parse(retrievedObject).mouseposition

		for (var e in a) {
			var coords = (a[e][Object.keys(a[e])[0]]);
			var el = $("<div>").addClass("heat");
			el.css("left", coords[0]);
			el.css("top", coords[1]);
			$("body").append(el);
		}	
	}

	
	// Add handler to button
	$(".draw-heatmap").click(drawHeatmap);
		
});