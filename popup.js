
$(window).load(function() {
	
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
	var b = Object.keys(localStorage)
	for (var a in b) {
		if (b[a].indexOf("usability|") == 0) {
			$("ul.list").append("<li>" + b[a] + "</li>");
		}
	}
	
	// Add handler to button
	$(".draw-heatmap").click(drawHeatmap);
		
});