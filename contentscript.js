// TODO
// Parse client info
// Store task-by-task, not page by page

// Need to implement chrome.storage

// Build the data object (globalize it)
var st = new Date(),
	data = {};
data.click = [];
data.mouseposition = [];
data.keypress = [];
data.clientInfo = {};
data.url = window.location.href;
data.title = document.title;

function networkInfo() {
	var imageAddr = "https://presscdn.com/wp-content/uploads/2013/06/wordpress-cdn-map.png" + "?n=" + Math.random(); // Swap this for something real
	var startTime, endTime;
	var downloadSize = 10000;
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
	// track clicks
	
	// edit: track only ui elements:
	
	$("input, button, textarea, a, #my-timeline *").click(function() {
	//$("*").click(function() {
		var timestamp =  String((new Date).getTime()),
			//which = this.nodeName + " " + this.className; // Need to improve this
			which = this;
			
		var d = {};
		d[timestamp] = sanitize(which);
		data.click.push(d);
	});
}


function init() {
	console.log("init");
	// Initialize tracking
	networkInfo();
	clientInfo();
	c();
	k();
	m();
}

chrome.storage.local.get('status', function(items) {
	console.log(items["status"]);
	if (items["status"] == "running") {
		init();
	}
});

// Listener for message from popup
chrome.extension.onMessage.addListener(function(request,sender,sendResponse) {
    alert("rec");
	if (request.action === "start" ) {
        //init();
		sendResponse( {data:"success"} );
    }
});



// Store data on unload
window.onbeforeunload = function() {
	// Log time on page
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
			console.log(itemTitle)
		});
		console.log(JSON.stringify(data));
		return "wait";
	});	
	
	// chrome.storage.local.set({"test": Math.random()}, function() {
		// console.log("saved2	")
	// });
}

// Retrieve the data (todo: parse/text it)
// Pass the name of the page to retrieve
function retrieve(url) {
	var retrievedObject = localStorage.getItem(url);
	console.log('retrievedObject: ', JSON.parse(retrievedObject));
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

