function get() {
	chrome.storage.local.get(null, function(items) {
		var b = Object.keys(items);
		for (var a in b) {
			var obj = JSON.parse(items[b[a]]);
			$("ul.list").append("<li><a href='" + obj.url + "'>" + obj.title + "</a></li>");
		}
	});
}


$(window).load(function() {
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