function get() {
	chrome.storage.local.get(null, function(items) {
		// if (items.status == "running") {
			// $("#test").addClass("start");
		// } else {
			// $("#test").removeClass("start");
		// }
		var b = Object.keys(items);
		for (var a in b) {
			if (b[a].indexOf("usability|") == 0) {
				var obj = JSON.parse(items[b[a]]);
				$("ul.list").append("<li><a href='" + obj.url + "'>" + obj.title + "</a></li>");
			}
		}
	});
}

function start() {
	chrome.storage.local.set({"status":"running"}, function() {
		$("#test").removeClass("start").text("Stop Test");
	});
}

function stop() {
	chrome.storage.local.set({"status":"stopped"}, function() {
		$("#test").addClass("start").text("Start Test");
	});
}


$(window).load(function() {
	
	$("#test").click(function() {
		$(this).hasClass("start") ? start() : stop();
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
	
	
	// Init the list
	
	chrome.storage.local.get(null, function(items) {
		var b = Object.keys(items);
		for (var a in b) {
			if (b.indexOf("usability|") == 0) {
				$("ul.list").append("<li>" + items[b] + "</li>");
			}
		}
	});
	
	// Add handler to button
	$(".draw-heatmap").click(drawHeatmap);
		
});