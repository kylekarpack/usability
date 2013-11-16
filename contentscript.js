// TODO
// Parse client info, display it
// one-click heatmaps
// add click data, keypresses, etc to heatmap
// keyboard shortcuts

// windowing doesn't work on OSX! Why?

/*
$(window).keyup(function(e) {
	if (e.keyCode == 65 && e.altKey && e.shiftKey) {
		chrome.runtime.sendMessage({action:'start'});
		init();
	} else if (e.keyCode == 83 && e.altKey && e.shiftKey) {
		chrome.runtime.sendMessage({action:'stop'});
		record();
	}
	
});
*/


// Build the data object (globalize it)
var st,
	data = {};
data.click = [];
data.mouseposition = [];
data.keypress = [];
data.clientInfo = {};
data.url = window.location.href;
data.title = document.title;


function networkInfo() {
	var imageAddr = "https://presscdn.com/wp-content/uploads/2013/06/wordpress-cdn-map.png" + "?n=" + Math.random(); // Swap this for something real?
	var startTime, endTime;
	var downloadSize = 10000; // Todo: get correct size
	var download = new Image();
	download.onload = function () {
		endTime = (new Date()).getTime();
		showResults();
	}
	startTime = (new Date()).getTime();
	download.src = imageAddr;

	function showResults() {
		var duration = (endTime - startTime) / 1000;
		var bitsLoaded = downloadSize * 8;
		var speedKbps = (Math.round(bitsLoaded / duration) / 1024).toFixed(2);
		data.networkSpeed = parseFloat(speedKbps);
	}
}

// Run tests
function clientInfo() {
	var store = navigator;
	
	// remove methods
	data.clientInfo = sanitize(navigator);
	data.clientInfo.screenWidth = window.innerWidth;
	data.clientInfo.screenHeight = window.innerHeight;
	// could parse additional here for useful info
}

function m() {
	// Track mouse movement
	$(window).mousemove(function() {
		//var timestamp =  String((new Date).getTime()),
		var x = this.event.clientX,
			y = this.event.clientY + $(this).scrollTop(); // account for scrolled down
		//var d = {};
		var arr = [x,y];
		data.mouseposition.push(arr);
	});
}

function k() {
	// track keypresses
	$(window).keypress(function() {
		var timestamp =  String((new Date).getTime()),
			which = this.event.keyCode;
			
		var d = {};
		d[timestamp] = which;
		data.keypress.push(d);
	});
}

function c() {
	// track clicks on ui elements. Could modify to track all clicks?	
	$("input, button, textarea, a").click(function() {
	//$("*").click(function() {
		var timestamp =  String((new Date).getTime()),
			which = this;
			
		var d = {};
		d[timestamp] = sanitize(which);
		data.click.push(d);
	});
}


function init() {
	st = new Date();
	// Initialize tracking
	networkInfo();
	clientInfo();
	c();
	k();
	m();
}

chrome.storage.local.get('status', function(items) {
	if (items["status"] == "running") {
		init();
	}
});



// Store data on unload
window.onbeforeunload = record;

function record(andStop) {
	
	chrome.storage.local.get('status', function(items) {
		
		if (items["status"] == "running" || andStop == "stopit") {
	
			data.timeOnPage = ((new Date()) - st);
			
			var itemTitle = window.location.href;
			var obj = {};
			obj[itemTitle] = JSON.stringify(data);
			
			chrome.storage.local.get(null, function(items) {
				var name = items.currentTestName;
				
				if (typeof(items.tests) == 'undefined') { // first run
					items.tests = {};
				}
				
				if (typeof(items.tests[name]) == 'undefined') { // first run for a given test
					items.tests[name] = [];
				}
				
				items.tests[name].push(data);
				
				chrome.storage.local.set(items, function() {
					//silence is golden
				});				
				
			});	
		} // else, do nothing
		
	});
}


// Utility
function sanitize(store) {
	for (key in store) {
		var temp = String(store[key]).toString();
		delete store[key];
		store[key] = temp;
	}
	var t = store;
	return t;
}


function drawHeatmap(testName) {
	$("body").append("<div id='heatmapArea'></div>");
	$("#heatmapArea").height($("body").height()); //buggy
	
	var config = {
        element: document.getElementById("heatmapArea"),
        radius: 30,
        opacity: 50,
		gradient: { 0.2: "rgb(0,0,255)", 0.3: "rgb(0,100,255)", 0.4: "rgb(0,200,200)", 0.5: "rgb(0,255,100)",0.7: "rgb(0,255,0)", 0.9: "rgb(100,255,0)", 0.98: "yellow", 0.992: "rgb(250,150,0)", 0.995: "rgb(255,0,0)" }
    };
    
    //creates and initializes the heatmap
    var heatmap = h337.create(config);
	
	chrome.storage.local.get(null, function(items) {
		var href = window.location.href;
		var pages = items.tests[testName];
		var data;
		for (pg in pages) {
			if (pages[pg].url == href) {
				//target = pages[pg]mouseposition];
				data = pages[pg].mouseposition;
			}
		}
		
		for (datum in data) {
			if (data[datum][0] > 0 && data[datum][1] > 0) {
				heatmap.store.addDataPoint(data[datum][0], data[datum][1]);
			}
		}
	});
	
	
    for (datum in data) {
		if (data[datum][0] > 1 && data[datum][1] > 1) {
			heatmap.store.addDataPoint(data[datum][0], data[datum][1]);
		}
	}
}


chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	if (request.action == "heat") {
		console.log("map drawn");
		drawHeatmap(request.testName);
		sendResponse({dom: "heatmap drawn"});
	} else if (request.action == "start") {
		init();
		sendResponse({dom: "init"});
	} else if (request.action == "stop") {
		record("stopit");
		
		sendResponse({dom: "done"});
	}
});

