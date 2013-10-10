// TODO
// Wrap with a manifest to turn into a Chrome Extension
// Parse client info


// Include jQuery to make DOM manipulation easier (can remove when packaged)
(function() {
	// Load the script
	var script = document.createElement("script");
	script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js';
	script.type = 'text/javascript';
	document.getElementsByTagName("head")[0].appendChild(script);
	var checkReady = function(callback) {
		if (window.jQuery) {
			callback(jQuery);
		}
		else {
			window.setTimeout(function() { checkReady(callback); }, 100);
		}
	};
	checkReady(function($) {
		init(); // Initialize tracking
	});
})();

// Build the data object (globalize it)
var data = {};
data.click = [];
data.mouseposition = [];
data.keypress = [];
data.clientInfo = {};
data.networkSpeed = {};

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
			y = this.event.clientY;
		var d = {};
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
	// Initialize tracking
	networkInfo();
	clientInfo();
	c();
	k();
	m();
}

// Store data on unload
window.onbeforeunload = function() {
	var itemTitle = window.location.href;
	
	localStorage.setItem(itemTitle, JSON.stringify(data));
	return 'Your browsing data has been saved in local storage';
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

