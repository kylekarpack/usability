console.log("backgroundjs loaded");

// Colors
function HSVtoRGB(e,t,n){var r,i,s,o,u,a,f,l;if(e&&t===undefined&&n===undefined){t=e.s,n=e.v,e=e.h}o=Math.floor(e*6);u=e*6-o;a=n*(1-t);f=n*(1-u*t);l=n*(1-(1-u)*t);switch(o%6){case 0:r=n,i=l,s=a;break;case 1:r=f,i=n,s=a;break;case 2:r=a,i=n,s=l;break;case 3:r=a,i=f,s=n;break;case 4:r=l,i=a,s=n;break;case 5:r=n,i=a,s=f;break}return{r:Math.floor(r*255),g:Math.floor(i*255),b:Math.floor(s*255)}}

// Messages
chrome.runtime.onMessage.addListener(function(msg, sender) {
    console.log(msg);
});


// IndexedDB
database.init(function(s) {
	server = s;
})


check();
setInterval(check, 300000);

function check() {
	chrome.storage.sync.get("global", function(data) {

		$.getJSON("http://www.bing.com/maps/directions.ashx?d=0~1&w=" + data.global.homeAddress + "~" + data.global.workAddress + "&mode=D")
			.success(function(d) { 
				console.warn("Checked at " +new Date() )
				d.fromAddress = data.global.fromAddress;
				d.toAddress = data.global.toAddress;
				storeData(d)
									
				
	
				/*
	
				chrome.notifications.create(
			        'id1',{   
			            type:"basic",
			            title:"Time to go home",
			            message:"You should be getting home soon! It'll take you about " + timeInMinutes + " minutes",
			            iconUrl:"img/icon-64.png"
			        }, function() { } 
			    );
					
	*/	
		
			});
		});
}

