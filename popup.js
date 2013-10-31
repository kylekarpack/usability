function get() {
	chrome.storage.local.get(null, function(items) {
		if (items.status == "running") {
			startHandler(items.currentTestName);
		} else {
			stopHandler();
		}
		
		var limit = 10;
		var b = Object.keys(items.tests); // todo: most recent first
		var itemsFound = false;
		for (var a in b) {
			if (a < limit) { // Limit to most recent 10
				var obj = items.tests[b[a]];
				
				//var truncTitle = obj.title.substring(0,60).length < obj.title.length ? obj.title.substring(0,60) + "..." : obj.title;
				//var button = 
				itemsFound = true;
				
				var pageList = "",
					totalClicks = 0,
					totalMouse = 0,
					time = 0,
					avgSpeed = 0;
				
				for (var i in obj) {
					pageList += "<a class='more' href='" + obj[i].url + "'>" + obj[i].title + "</a>" +
					"<div class='info'>" + obj[i].mouseposition.join(", ") + "</div>" +
					" | ";
					totalClicks += obj[i].click.length;
					totalMouse += obj[i].mouseposition.length;
					time += obj[i].timeOnPage;
					avgSpeed += parseFloat(obj[i].networkSpeed);
						console.log(obj[i]);
				}
				
				avgSpeed = avgSpeed / obj.length;
				
				var timeStr = Math.floor(time / 60) + ":" + Math.round(time % 60);
				
				$("ul.list").append("<li><span class='title'>" + b[a] + "</span><br /><small>" + 
					"Connection Speed: " + avgSpeed + "<br />" +
					"Time: " + timeStr + "<br />" +
					"Pages: " + pageList + "<br />" +
					"Mouse: " + totalMouse + "<br />" +
					"Clicks: " + totalClicks +
					// "Keys: " + obj.keypress.length +
					
					"</small></li>");
			}
		}
		
		$("a.more").click(function(e) {
			e.preventDefault();
			// var url = $(this).attr("href"),
				// test = $(this).parent().parent().find(".title").text();
			// $(this).after($("<div>").html(
				// url + "   " + test
			// ));
			$(this).siblings(".info").show();
		});
		
		if (!itemsFound) {
			$("ul.list").append("<li>Sorry, no tests are stored yet</li>");
		}
	});
}

// todo - fix
function test() {
	chrome.extension.sendMessage({action: "start"},
        function (response) {
           console.log(response);
        }
	);
}

function start() {
	var n = $("#name").val() !== "" ? $("#name").val() : "Test started at " + (new Date).toString();
	chrome.storage.local.set({"status":"running", "currentTestName": n}, function() {
		startHandler();
	});
}

function stop() {
	chrome.storage.local.set({"status":"stopped"}, function() {
		stopHandler();
	});
}

// todo: fix
function startHandler(testName) {
	$("#test").removeClass("start").text("Stop Test");
	chrome.browserAction.setBadgeText({text:"Live"});
	$("#name").val(testName).prop("disabled", true);
	
	// chrome.tabs.getSelected(null, function(tab) {
		// console.log(tab);
		// chrome.tabs.sendRequest(tab.id, { method: 'init', tabid: tab.id}, function(r) { 
			// console.log(r.data); 
		// });
		// );
	// });
	
}

function stopHandler() {
	$("#test").addClass("start").text("Start Test");
	chrome.browserAction.setBadgeText({text:""});
	$("#name").val("").prop("disabled", false);

}


function drawHeatmap(testName, pageName) {
	chrome.storage.local.get(null, function(items) {
		var obj = items.tests[testName];
		var a;
		for (var i in obj) {
			if (obj[i].url == pageName) {
				a = obj[i];
			}
		}
		
		a = a.mouseposition;
		
		console.log(a);
		
		for (var e in a) {
			var coords = (a[e][Object.keys(a[e])[0]]);
			var el = $("<div>").addClass("heat");
			el.css("left", coords[0]);
			el.css("top", coords[1]);
			$("body").append(el);
		}	
		
	});
	

	
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
	
	// Add handler to button
	$(".draw-heatmap").click(drawHeatmap);
		
});