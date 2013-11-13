
// Listen for keyboard shortcuts
// Todo: Fix bug not always working
chrome.commands.onCommand.addListener(function(command) {
	if (command == "start_usability") {
		start();
	} else if (command == "stop_usability") {
		stop();
	}

});


function get(target) {
	chrome.storage.local.get(null, function(items) {
		if (items.status == "running") {
			startUI(items.currentTestName);
		} else {
			stopUI();
		}
		
		var limit = 10;
		if (typeof(items.tests) == 'object') {
			var b = Object.keys(items.tests); // todo: most recent first
			for (var a in b) {
				if (a < limit) { // Limit to most recent 10
					var obj = items.tests[b[a]];
					//var button = 
					
					var pageList = "",
						totalClicks = 0,
						totalMouse = 0,
						time = 0,
						avgSpeed = 0;
					
					for (var i in obj) {
						var cl = obj[i].url == target ? "current" : "";
						if (pageList.indexOf(obj[i].url) == -1) {
							pageList += "<a class='more " + cl + "' href='" + obj[i].url + "'>" + obj[i].title + "</a>" +
							"<div class='info'>" + obj[i].mouseposition.join(", ") + "</div>" +
							" | ";
						}
						totalClicks += obj[i].click.length;
						totalMouse += obj[i].mouseposition.length;
						var addTime = isNaN(parseInt(obj[i].timeOnPage)) ? 0 : obj[i].timeOnPage;
						time += addTime;
						avgSpeed += parseFloat(obj[i].networkSpeed);
					}
					
					
					avgSpeed = avgSpeed / obj.length;
					var t = new Date(time);
					var secStr = t.getSeconds() < 10 ? "0" + t.getSeconds() : t.getSeconds();
					
					var timeStr = t.getMinutes() + ":" + secStr;
					
					
					$("ul.list").append("<li><span class='title'>" + b[a] + "</span><span class='delete'></span><br /><small>" + 
						"Connection Speed: " + (Math.round(avgSpeed * 100) / 100) + "<br />" +
						"Time: " + timeStr + "<br />" +
						"Pages: " + pageList + "<br />" +
						"Mouse: " + totalMouse + "<br />" +
						"Clicks: " + totalClicks +
						// "Keys: " + obj.keypress.length +
						
						"</small></li>");
				}
			}
			
			// because of dumb extension behavior
			$("a.more").not(".current").click(function(e) {
				window.open($(this).attr("href"));
			});
			
			$("a.current").click(function(e) {
				dom();
			});
			
			
			$(".delete").click(function() {
				var li = $(this).parent();
				var key = li.find(".title").text();
				var y = $("<button>").addClass("yn").text("Yes").click(yes);
				var n = $("<button>").addClass("yn").text("No").click(no);
				var $conf = $("<div>").addClass("confirm");
				var $div = $("<div>").addClass("inner").html("Are you sure?<br />").append(y).append(n);
				$conf.append($div);
				$(this).after($conf).fadeIn();
				
				function yes() {
				//if (confirm("Are you sure you want to delete " + key + "? This cannot be undone")) {
					chrome.storage.local.get(null, function(items) {
						delete items.tests[key];
						chrome.storage.local.set(items,function() {
							li.slideUp();
						});
					});
				//}
				}
				
				function no() {
					$(".confirm").fadeOut();
				}
			});
		
		} else { 
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
	var n = $("#name").val() !== "" ? $("#name").val() : "Test started at " + (new Date).toLocaleString();
	chrome.storage.local.set({"status":"running", "currentTestName": n}, function() {
		startHandler();
	});
}

function stop() {
	chrome.storage.local.set({"status":"stopped"}, function() {
		stopHandler();
	});
}

function startUI(testName) {
	$("#test").removeClass("start").text("Stop Test");
	chrome.browserAction.setBadgeText({text:"Live"});
	$("#name").val(testName).prop("disabled", true);
}

function stopUI() {
	$("#test").addClass("start").text("Start Test");
	chrome.browserAction.setBadgeText({text:""});
	$("#name").val("").prop("disabled", false);
}

function startHandler(testName) {
	startUI();
	
	chrome.tabs.getSelected(null, function(tab) {
	  chrome.tabs.sendRequest(tab.id, {action: "start"}, function(response) {
		//silence
	  });
	});
	
}

function stopHandler() {
	stopUI();
	
	chrome.tabs.getSelected(null, function(tab) {
	  chrome.tabs.sendRequest(tab.id, {action: "stop"}, function(response) {
		//silence
	  });
	});

}

function dom() {
	chrome.tabs.getSelected(null, function(tab) {
	  // Send a request to the content script.
	  var curr = $(".current").eq(0).parent().parent().find(".title").text();
	  chrome.tabs.sendRequest(tab.id, {action: "heat", testName: curr}, function(response) {
		console.log(response);
	  });
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
	
	chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {
		 var target = arrayOfTabs[0].url;
		 get(target);
	  });
});