// TODO
// Parse client info

// Build the data object (globalize it)
var st = new Date(),
	data = {};
data.click = [];
data.mouseposition = [];
data.keypress = [];
data.clientInfo = {};


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
		data.networkSpeed = speedKbps;
	}
}

// Run tests
function clientInfo() {
	var store = navigator;
	// remove methods
	
	data.clientInfo = sanitize(navigator);

	// could parse data here for useful info
}

function m() {
	// Track mouse movement
	$(window).mousemove(function() {
		var timestamp =  String((new Date).getTime()),
			x = this.event.clientX,
			y = this.event.clientY + $(this).scrollTop(); // account for scrolled down
		var d = {};
		console.log(data.mouseposition);
		d[timestamp] = [x, y];
		data.mouseposition.push(d);
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

init();

// Store data on unload
window.onbeforeunload = function() {
	// Log time on page
	data.timeOnPage = ((new Date()) - st) / 1000;
	
	var itemTitle = "usability|" + window.location.href;
	
	localStorage.setItem(itemTitle, JSON.stringify(data));
	chrome.storage.local.set({itemTitle: JSON.stringify(data)}, function() {
		message("Saved!");
	});
	//return 'Your browsing data has been saved in local storage';
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

