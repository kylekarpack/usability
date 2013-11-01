// TODO
// Parse client info
// Store task-by-task, not page by page

// Need to implement chrome.storage

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

function record() {
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

function drawHeatmap() {
	$("body").append("<div id='heatmapArea'></div>");
	$("#heatmapArea").height($(window).height())
	
	var config = {
        element: document.getElementById("heatmapArea"),
        radius: 30,
        opacity: 50
    };
    
    //creates and initializes the heatmap
    var heatmap = h337.create(config);
 
    // let's get some data
	var data = [[71,99],[70,97],[70,98],[70,99],[65,199],[65,224],[95,337],[98,343],[101,347],[104,352],[108,358],[113,365],[117,373],[122,380],[126,386],[130,391],[134,396],[138,399],[141,403],[144,406],[151,412],[157,414],[163,416],[170,418],[178,419],[186,420],[197,422],[209,422],[222,422],[235,420],[249,418],[264,416],[282,412],[299,407],[315,402],[330,397],[342,392],[373,386],[408,260],[406,255],[404,251],[404,247],[403,241],[402,236],[401,231],[401,227],[401,223],[401,220],[400,216],[399,212],[398,206],[396,199],[395,191],[393,183],[391,177],[390,172],[389,165],[387,160],[386,155],[384,152],[381,147],[381,147],[379,143],[376,140],[371,136],[365,132],[360,129],[352,125],[345,122],[267,107],[181,131],[127,188],[128,197],[129,200],[130,201],[131,203],[131,205],[131,206],[132,207],[132,207],[132,208],[133,208],[134,209],[134,209],[133,235],[128,307],[128,308],[128,309],[128,310],[128,310],[128,310],[132,310],[136,310],[141,310],[147,310],[152,310],[159,311],[167,311],[175,311],[180,311],[186,311],[194,311],[202,311],[213,311],[225,311],[238,311],[251,311],[263,311],[275,311],[288,311],[300,311],[311,310],[320,310],[328,309],[334,308],[338,307],[340,307],[342,307],[342,306],[344,305],[344,302],[344,297],[344,289],[341,281],[338,272],[335,264],[332,256],[329,247],[326,241],[324,238],[322,235],[321,231],[319,227],[316,222],[314,219],[312,215],[309,213],[307,210],[303,207],[300,204],[296,201],[290,197],[283,192],[274,186],[264,181],[256,175],[246,170],[235,164],[224,161],[216,157],[216,157],[207,155],[203,153],[198,152],[191,151],[183,151],[175,150],[167,150],[160,150],[154,151],[145,153],[141,154],[136,156],[132,157],[130,158],[128,160],[126,160],[125,161],[123,162],[120,166],[117,169],[113,175],[109,183],[105,191],[101,200],[98,208],[94,218],[94,218],[92,227],[91,235],[90,245],[89,254],[89,261],[89,266],[89,271],[89,276],[90,283],[91,290],[92,298],[94,305],[96,312],[99,318],[101,324],[103,329],[106,334],[109,339],[113,345],[117,350],[124,356],[131,360],[138,365],[147,371],[154,374],[160,377],[167,380],[174,383],[185,387],[196,391],[208,394],[219,396],[230,397],[243,398],[255,398],[268,398],[278,398],[288,398],[298,398],[311,397],[320,397],[332,396],[341,396],[347,396],[353,396],[358,396],[366,396],[374,396],[381,395],[389,394],[396,394],[404,394],[411,394],[416,394],[422,394],[426,395],[429,395],[431,395],[433,395],[435,395],[436,395],[438,394],[440,393],[442,391],[443,386],[446,381],[450,364],[450,356],[450,341],[450,331],[450,322],[450,313],[450,303],[449,294],[449,286],[449,280],[449,275],[449,268],[449,261],[449,253],[449,248],[449,242],[448,238],[448,234],[447,230],[446,227],[446,225],[445,220],[444,215],[443,210],[441,205],[438,199],[436,195],[434,192],[430,188],[427,185],[423,182],[421,181],[419,179],[416,178],[413,177],[410,176],[407,175],[405,174],[402,174],[397,172],[393,172],[390,171],[387,171],[385,171],[384,171],[381,171],[380,171],[377,172],[375,172],[373,173],[371,174],[371,175],[370,176],[369,177],[369,178],[368,180],[368,183],[368,186],[368,190],[371,195],[376,201],[382,209],[385,214],[390,219],[395,226],[395,226],[402,234],[408,241],[414,247],[422,255],[429,261],[435,266],[440,270],[444,273],[448,277],[455,282],[462,286],[468,291],[474,296],[481,300],[489,306],[496,310],[500,311],[504,314],[509,317],[513,321],[519,325],[523,327],[526,329],[533,332],[553,339],[575,344],[582,346],[583,347],[584,347],[585,349],[586,350],[587,352],[588,353],[588,354],[588,355],[589,355],[592,355],[596,356],[600,357],[607,358],[612,359],[621,360],[629,361],[637,362],[645,363],[652,364],[656,365],[661,366],[666,366],[674,367],[685,368],[694,369],[705,370],[715,371],[725,372],[732,373],[738,373],[742,374],[747,374],[754,375],[773,377],[781,378],[788,380],[795,381],[801,382],[804,383],[806,383],[809,383],[812,385],[815,385],[818,386],[822,387],[826,387],[831,387],[835,387],[838,387],[840,387],[842,387],[845,388],[848,389],[850,389],[853,390],[855,390],[856,391],[857,391],[858,391],[859,392],[861,392],[862,393],[863,394],[864,394],[871,396],[878,399],[881,400],[881,402],[880,408],[875,415],[871,421],[868,426],[865,430],[861,434],[859,437],[856,441],[852,446],[850,449],[847,454],[843,459],[839,465],[835,468],[833,472],[829,477],[824,483],[819,489],[813,495],[807,501],[807,501],[801,506],[799,510],[795,512],[790,516],[784,520],[778,525],[770,530],[764,535],[758,538],[752,541],[747,542],[745,544],[742,545],[740,545],[735,546],[735,546],[730,546],[726,546],[722,546],[718,546],[715,546],[713,546],[711,546],[710,546],[708,545],[708,545],[706,544],[703,543],[700,542],[697,541],[694,540],[690,539],[685,538],[681,537],[677,536],[677,536],[671,535],[671,535],[666,534],[665,534],[662,534],[660,533],[658,533],[657,533],[656,533],[655,533],[654,533],[653,533],[653,534],[653,535],[653,536],[654,537],[656,538],[659,540],[662,541],[668,543],[671,543],[675,544],[675,544],[677,545],[680,545],[680,545],[681,545],[682,546],[682,546],[685,546],[687,546],[691,546],[696,547],[701,547],[708,549],[714,550],[718,551],[721,552],[727,553],[734,555],[741,556],[749,557],[758,558],[768,559],[777,559],[784,559],[789,559],[795,559],[802,557],[809,554],[818,550],[825,544],[825,544],[831,538],[831,538],[838,531],[843,523],[847,515],[850,510],[852,506],[854,500],[856,493],[857,486],[858,480],[858,476],[859,473],[859,472],[859,471],[859,470],[859,469],[859,468],[858,468],[857,466],[856,466],[853,464],[852,463],[851,462],[849,461],[848,460],[847,460],[845,459],[843,456],[841,454],[839,452],[834,450],[830,447],[824,444],[819,442],[815,441],[810,441],[805,439],[797,439],[788,438],[779,437],[768,437],[760,437],[751,437],[744,438],[740,439],[735,440],[729,442],[722,445],[714,448],[707,453],[699,457],[693,462],[689,465],[684,469],[680,472],[678,474],[676,476],[675,477],[674,478],[674,479],[674,480],[675,482],[678,483],[683,484],[688,484],[694,484],[702,484],[711,483],[719,482],[726,481],[729,480],[736,479],[742,478],[748,476],[752,474],[757,472],[759,471],[762,468],[764,467],[766,465],[767,463],[769,462],[769,460],[770,459],[771,456],[773,451],[774,448],[774,444],[775,441],[777,436],[778,433],[778,430],[779,428],[780,426],[781,424],[781,423],[783,422],[784,420],[786,418],[789,416],[793,414],[797,411],[799,410],[800,409],[803,408],[806,408],[809,407],[817,406],[825,406],[833,407],[842,409],[850,411],[856,413],[860,414],[862,414],[865,415],[871,416],[884,417],[897,420],[904,420],[905,420],[906,420],[908,420],[911,420],[917,420],[925,420],[936,420],[947,420],[961,420],[961,420],[974,420],[983,420],[991,420],[991,420],[998,420],[1006,419],[1016,419],[1027,419],[1037,419],[1046,419],[1054,419],[1062,419],[1068,419],[1073,419],[1076,419],[1079,419],[1080,419],[1083,419],[1086,419],[1088,419],[1091,419],[1094,419],[1097,419],[1101,419],[1103,419],[1106,419],[1107,419],[1108,419],[1109,419],[1110,419],[1109,419],[1108,419],[1107,419],[1106,419],[1105,419],[1105,418],[1106,417],[1108,416],[1110,415],[1112,415],[1115,414],[1117,414],[1118,413],[1120,412],[1123,411],[1128,410],[1130,409],[1132,409],[1133,409],[1134,409],[1135,409],[1136,409],[1137,409],[1138,409],[1139,409],[1140,409],[1141,409],[1141,409],[1130,410],[1116,411],[1107,411],[1099,411],[1088,411],[1074,410],[1045,405],[1011,400],[1011,400],[969,395],[931,388],[931,388],[892,381],[850,375],[824,372],[809,370],[795,369],[773,366],[742,363],[714,361],[688,358],[665,355],[646,355],[626,354],[611,353],[598,353],[587,352],[579,351],[574,351],[570,351],[567,351],[564,351],[562,351],[559,351],[557,351],[555,351],[553,351],[551,352],[549,353],[548,354],[545,356],[543,358],[542,360],[540,361],[540,362],[539,363],[533,369],[525,380],[519,388],[514,400],[509,415],[507,422],[505,432],[503,444],[500,457],[498,467],[496,475],[495,481],[494,489],[493,497],[490,515],[489,523],[487,530],[485,538],[485,538],[484,545],[483,551],[483,551],[482,557],[481,559],[481,561],[481,563],[480,566],[478,571],[476,574],[475,579],[473,582],[471,585],[469,587],[467,590],[466,592],[465,593],[463,594],[463,595],[462,595],[461,596],[461,597],[459,598],[457,601],[455,603],[453,605],[451,606],[449,607],[447,609],[445,610],[443,611],[440,612],[438,613],[436,613],[431,615],[427,617],[421,619],[415,622],[409,624],[403,627],[396,629],[389,632],[381,634],[374,635],[369,636],[364,636],[361,637],[359,637],[356,637],[353,638],[350,638],[349,638],[348,638],[346,637],[344,636],[342,633],[338,630],[333,626],[327,621],[321,615],[316,611],[311,607],[309,604],[305,601],[300,596],[297,591],[293,588],[289,583],[287,579],[284,575],[282,572],[281,569],[280,567],[279,566],[279,564],[278,563],[277,561],[276,559],[276,555],[276,554],[275,553],[275,552],[275,550],[274,550],[274,548],[274,547],[274,546],[274,545],[275,544],[276,543],[277,543],[278,542],[279,542],[280,542],[281,542],[279,543],[277,545],[274,547],[270,550],[267,551],[264,553],[259,554],[252,556],[247,557],[240,558],[236,558],[232,558],[227,558],[223,558],[220,558],[218,558],[216,557],[212,557],[208,555],[206,554],[204,553],[204,552],[203,552],[203,551],[202,551],[202,550],[201,549],[201,548],[200,548],[200,547],[200,546],[200,545],[200,544],[200,543],[200,541],[202,539],[203,537],[205,535],[207,533],[208,533],[208,532],[209,532],[209,531],[210,531],[211,530],[213,529],[215,527],[216,527],[218,525],[220,524],[223,522],[227,521],[230,518],[235,515],[238,513],[242,509],[244,507],[247,504],[248,503],[248,502],[249,502],[250,501],[250,498],[251,496],[251,493],[251,489],[251,486],[251,483],[250,480],[248,478],[246,476],[245,475],[242,474],[240,472],[237,471],[231,469],[227,468],[221,466],[214,465],[209,464],[203,464],[198,464],[193,464],[191,464],[189,465],[187,465],[185,466],[183,466],[181,467],[181,467],[180,467],[179,467],[179,468],[179,469],[179,470],[179,471],[179,473],[179,475],[181,478],[182,479],[183,480],[185,483],[189,484],[192,486],[196,486],[200,486],[204,486],[209,486],[212,486],[215,485],[220,484],[226,482],[233,479],[238,477],[243,474],[247,472],[249,471],[251,470],[253,468],[254,468],[255,467],[256,466],[258,464],[259,461],[261,459],[261,457],[263,454],[264,450],[264,449],[264,448],[265,448],[265,447],[265,446],[265,445],[265,444],[265,441],[265,439],[265,438],[265,436],[263,434],[262,431],[260,429],[258,428],[256,427],[256,427],[255,426],[253,426],[250,425],[247,424],[244,423],[243,423],[242,423],[240,423],[239,423],[238,423],[237,423],[237,424],[237,425],[239,427],[240,430],[243,434],[245,438],[248,440],[249,441],[250,443],[254,444],[254,444],[257,447],[259,448],[262,449],[265,450],[267,450],[269,450],[271,450],[274,450],[276,449],[278,447],[280,445],[284,441],[289,434],[294,427],[294,427],[300,418],[305,407],[311,397],[315,389],[319,380],[322,372],[324,366],[325,363],[326,358],[327,356],[327,354],[327,353],[327,351],[327,349],[327,346],[325,344],[324,341],[322,336],[320,333],[319,331],[318,329],[315,325],[313,321],[308,314],[307,312],[305,309],[302,307],[299,305],[297,304],[294,303],[291,302],[287,302],[282,302],[277,302],[272,302],[267,302],[259,305],[254,307],[250,309],[248,310],[246,311],[245,311],[244,312],[240,314],[237,316],[232,318],[229,320],[227,321],[224,322],[222,323],[221,324],[220,325],[220,326],[220,327],[223,329],[225,330],[227,330],[229,330],[230,330],[231,330],[233,330],[234,330],[236,329],[240,328],[243,325],[246,323],[261,313],[264,310],[267,309],[269,307],[272,304],[275,301],[278,297],[282,292],[285,289],[286,285],[289,281],[290,278],[292,275],[292,273],[292,272],[292,271],[292,270],[293,270],[293,269],[293,268],[293,267],[293,266],[292,265],[291,264],[290,264],[289,262],[287,261],[284,259],[282,259],[280,256],[276,255],[274,253],[272,252],[271,252],[269,251],[268,250],[266,249],[263,248],[259,246],[255,246],[251,245],[246,243],[242,242],[237,241],[234,241],[233,240],[231,240],[230,240],[229,240],[228,240],[228,241],[227,241],[227,242],[227,244],[227,246],[227,247],[227,248],[227,249],[227,250],[227,251],[227,252],[227,253],[227,254],[227,255],[227,256],[227,257],[227,258],[227,259],[227,260],[227,261],[227,262],[227,263],[227,265],[227,266],[227,268],[227,269],[227,270],[227,271],[227,272],[227,273],[227,274],[228,276],[229,276],[230,277],[231,277],[233,278],[235,279],[237,279],[239,279],[240,279],[242,279],[243,279],[244,279],[245,279],[246,279],[249,278],[251,277],[254,276],[255,275],[257,273],[259,273],[260,271],[262,269],[266,266],[270,263],[273,258],[276,255],[280,249],[282,244],[283,241],[285,237],[287,234],[289,227],[291,221],[293,214],[294,209],[295,203],[295,197],[296,194],[297,191],[298,188],[298,187],[298,186],[298,185],[298,184],[298,183],[298,182],[299,181],[299,180],[299,179],[299,178],[299,177],[298,176],[298,175],[299,177],[300,180],[302,182],[305,184],[307,188],[311,190],[313,193],[315,195],[318,196],[318,197],[319,197],[320,198],[320,199],[321,199],[322,199],[323,199],[324,199],[325,199],[326,199],[327,199],[328,199],[329,199],[330,198],[330,197],[331,196],[331,195],[331,194],[332,194],[332,193],[332,192],[332,191],[331,191],[330,190],[329,190],[328,190],[327,190],[325,190],[324,191],[321,194],[317,197],[313,201],[311,204],[308,207],[306,211],[303,216],[300,221],[298,225],[298,225],[296,230],[295,233],[293,236],[292,239],[292,241],[292,243],[292,244],[292,245],[292,246],[292,247],[292,248],[292,249],[293,250],[295,250],[298,251],[303,252],[307,252],[310,252],[315,251],[321,249],[325,247],[329,245],[333,243],[339,240],[345,236],[352,233],[357,230],[361,228],[363,226],[363,225],[364,225],[365,224],[365,223],[365,222],[365,220],[364,220],[364,219],[362,218],[361,217],[360,216],[357,215],[356,214],[355,214],[354,214],[351,214],[350,214],[348,214],[345,216],[342,217],[338,220],[335,222],[332,225],[330,227],[329,229],[326,232],[325,233],[324,235],[323,236],[323,237],[323,238],[323,240],[323,241],[324,243],[327,247],[330,250],[333,254],[336,255],[338,257],[341,259],[347,262],[353,264],[361,267],[367,269],[373,270],[378,272],[382,272],[385,273],[388,273],[391,273],[392,273],[394,273],[395,273],[396,273],[398,273],[399,273],[400,272],[401,271],[402,269],[402,268],[403,266],[405,262],[406,258],[408,255],[409,250],[409,246],[409,242],[409,239],[409,236],[409,234],[409,232],[409,229],[409,227],[409,224],[409,223],[409,222],[409,221],[409,220],[409,218],[407,216],[406,214],[405,213],[405,212],[404,212],[404,211],[402,210],[377,201],[375,201],[374,201],[372,201],[369,200],[368,200],[367,200],[366,200],[363,200],[361,200],[359,201],[357,202],[356,202],[354,203],[353,203],[350,205],[347,206],[344,208],[342,209],[340,211],[338,213],[335,214],[335,215],[334,216],[332,217],[331,219],[329,220],[328,222],[326,223],[324,225],[322,226],[320,228],[318,230],[317,231],[316,232],[315,234],[312,235],[310,238],[308,240],[305,241],[304,244],[302,245],[301,247],[300,249],[299,250],[298,251],[298,252],[297,255],[296,256],[294,258],[293,261],[292,264],[291,266],[290,268],[290,270],[289,271],[288,272],[288,274],[287,274],[287,275],[286,276],[285,277],[280,280],[279,281],[278,282],[277,282],[277,283],[276,283],[276,284],[276,285],[276,285],[278,284],[282,280],[290,275],[300,267],[311,259],[319,254],[329,248],[344,239],[373,224],[402,206],[437,188],[471,170],[505,154],[505,154],[539,138],[570,124],[603,112],[621,105],[635,101],[647,97],[661,91],[686,84],[1161,1],[1219,1],[1212,5],[1193,151],[1191,151],[1189,152],[1185,152],[1178,152],[1166,152],[1149,151],[1121,146],[467,125],[299,152],[294,154],[331,151],[344,150],[356,149],[369,149],[383,148],[396,148],[411,147],[424,147],[438,147],[452,147],[465,147],[477,147],[487,147],[498,147],[506,148],[514,148],[520,148],[524,149],[526,149],[528,149],[529,149],[530,149],[530,150],[531,151],[531,152],[531,154],[192,148],[190,141],[188,134],[186,128],[185,124],[184,117],[183,116],[182,114],[182,113],[181,112],[181,110],[181,108],[181,107],[181,106],[181,104],[181,103],[181,102],[181,101],[181,100],[181,99],[180,98],[180,97],[180,96],[179,95],[179,94],[178,93],[176,93],[175,92],[175,91],[173,91],[170,89],[168,89],[166,88],[164,87],[162,86],[159,86],[157,85],[152,83],[149,83],[146,82],[143,82],[140,81],[131,78],[126,77],[124,76],[122,75],[120,75],[118,75],[117,74],[116,73],[115,73],[114,73],[114,72],[113,72],[112,72],[111,72],[111,71],[111,71],[111,70],[111,69],[111,68],[111,66],[111,63],[111,56],[111,52],[111,48],[111,43],[111,37],[111,34],[111,31],[111,27],[111,23],[111,20],[110,18],[110,15],[109,11],[108,8],[107,6],[106,3],[105,0]]
	// var res = 10;
	// var bucket = {};
    // for(var i=0;i<data.length;i++) {
		// var coor = [Math.round(data[i][0]/res), Math.round(data[i][1]/res)];

		// var pebble = coor.toString();
		// if(coor in bucket) {
			// bucket[pebble]++;
		// } else {
			// bucket[pebble] = 1;
		// }
	// }
	
	// var data = bucket;
 
    for (datum in data) {
		if (data[datum][0] > 1 && data[datum][1] > 1) {
			heatmap.store.addDataPoint(data[datum][0], data[datum][1]);
		}
	}
	
	
	// DEPRECATED IN FAVOR OF HEATMAP.JS
	
	// var data = [[71,99],[70,97],[70,98],[70,99],[65,199],[65,224],[95,337],[98,343],[101,347],[104,352],[108,358],[113,365],[117,373],[122,380],[126,386],[130,391],[134,396],[138,399],[141,403],[144,406],[151,412],[157,414],[163,416],[170,418],[178,419],[186,420],[197,422],[209,422],[222,422],[235,420],[249,418],[264,416],[282,412],[299,407],[315,402],[330,397],[342,392],[373,386],[408,260],[406,255],[404,251],[404,247],[403,241],[402,236],[401,231],[401,227],[401,223],[401,220],[400,216],[399,212],[398,206],[396,199],[395,191],[393,183],[391,177],[390,172],[389,165],[387,160],[386,155],[384,152],[381,147],[381,147],[379,143],[376,140],[371,136],[365,132],[360,129],[352,125],[345,122],[267,107],[181,131],[127,188],[128,197],[129,200],[130,201],[131,203],[131,205],[131,206],[132,207],[132,207],[132,208],[133,208],[134,209],[134,209],[133,235],[128,307],[128,308],[128,309],[128,310],[128,310],[128,310],[132,310],[136,310],[141,310],[147,310],[152,310],[159,311],[167,311],[175,311],[180,311],[186,311],[194,311],[202,311],[213,311],[225,311],[238,311],[251,311],[263,311],[275,311],[288,311],[300,311],[311,310],[320,310],[328,309],[334,308],[338,307],[340,307],[342,307],[342,306],[344,305],[344,302],[344,297],[344,289],[341,281],[338,272],[335,264],[332,256],[329,247],[326,241],[324,238],[322,235],[321,231],[319,227],[316,222],[314,219],[312,215],[309,213],[307,210],[303,207],[300,204],[296,201],[290,197],[283,192],[274,186],[264,181],[256,175],[246,170],[235,164],[224,161],[216,157],[216,157],[207,155],[203,153],[198,152],[191,151],[183,151],[175,150],[167,150],[160,150],[154,151],[145,153],[141,154],[136,156],[132,157],[130,158],[128,160],[126,160],[125,161],[123,162],[120,166],[117,169],[113,175],[109,183],[105,191],[101,200],[98,208],[94,218],[94,218],[92,227],[91,235],[90,245],[89,254],[89,261],[89,266],[89,271],[89,276],[90,283],[91,290],[92,298],[94,305],[96,312],[99,318],[101,324],[103,329],[106,334],[109,339],[113,345],[117,350],[124,356],[131,360],[138,365],[147,371],[154,374],[160,377],[167,380],[174,383],[185,387],[196,391],[208,394],[219,396],[230,397],[243,398],[255,398],[268,398],[278,398],[288,398],[298,398],[311,397],[320,397],[332,396],[341,396],[347,396],[353,396],[358,396],[366,396],[374,396],[381,395],[389,394],[396,394],[404,394],[411,394],[416,394],[422,394],[426,395],[429,395],[431,395],[433,395],[435,395],[436,395],[438,394],[440,393],[442,391],[443,386],[446,381],[450,364],[450,356],[450,341],[450,331],[450,322],[450,313],[450,303],[449,294],[449,286],[449,280],[449,275],[449,268],[449,261],[449,253],[449,248],[449,242],[448,238],[448,234],[447,230],[446,227],[446,225],[445,220],[444,215],[443,210],[441,205],[438,199],[436,195],[434,192],[430,188],[427,185],[423,182],[421,181],[419,179],[416,178],[413,177],[410,176],[407,175],[405,174],[402,174],[397,172],[393,172],[390,171],[387,171],[385,171],[384,171],[381,171],[380,171],[377,172],[375,172],[373,173],[371,174],[371,175],[370,176],[369,177],[369,178],[368,180],[368,183],[368,186],[368,190],[371,195],[376,201],[382,209],[385,214],[390,219],[395,226],[395,226],[402,234],[408,241],[414,247],[422,255],[429,261],[435,266],[440,270],[444,273],[448,277],[455,282],[462,286],[468,291],[474,296],[481,300],[489,306],[496,310],[500,311],[504,314],[509,317],[513,321],[519,325],[523,327],[526,329],[533,332],[553,339],[575,344],[582,346],[583,347],[584,347],[585,349],[586,350],[587,352],[588,353],[588,354],[588,355],[589,355],[592,355],[596,356],[600,357],[607,358],[612,359],[621,360],[629,361],[637,362],[645,363],[652,364],[656,365],[661,366],[666,366],[674,367],[685,368],[694,369],[705,370],[715,371],[725,372],[732,373],[738,373],[742,374],[747,374],[754,375],[773,377],[781,378],[788,380],[795,381],[801,382],[804,383],[806,383],[809,383],[812,385],[815,385],[818,386],[822,387],[826,387],[831,387],[835,387],[838,387],[840,387],[842,387],[845,388],[848,389],[850,389],[853,390],[855,390],[856,391],[857,391],[858,391],[859,392],[861,392],[862,393],[863,394],[864,394],[871,396],[878,399],[881,400],[881,402],[880,408],[875,415],[871,421],[868,426],[865,430],[861,434],[859,437],[856,441],[852,446],[850,449],[847,454],[843,459],[839,465],[835,468],[833,472],[829,477],[824,483],[819,489],[813,495],[807,501],[807,501],[801,506],[799,510],[795,512],[790,516],[784,520],[778,525],[770,530],[764,535],[758,538],[752,541],[747,542],[745,544],[742,545],[740,545],[735,546],[735,546],[730,546],[726,546],[722,546],[718,546],[715,546],[713,546],[711,546],[710,546],[708,545],[708,545],[706,544],[703,543],[700,542],[697,541],[694,540],[690,539],[685,538],[681,537],[677,536],[677,536],[671,535],[671,535],[666,534],[665,534],[662,534],[660,533],[658,533],[657,533],[656,533],[655,533],[654,533],[653,533],[653,534],[653,535],[653,536],[654,537],[656,538],[659,540],[662,541],[668,543],[671,543],[675,544],[675,544],[677,545],[680,545],[680,545],[681,545],[682,546],[682,546],[685,546],[687,546],[691,546],[696,547],[701,547],[708,549],[714,550],[718,551],[721,552],[727,553],[734,555],[741,556],[749,557],[758,558],[768,559],[777,559],[784,559],[789,559],[795,559],[802,557],[809,554],[818,550],[825,544],[825,544],[831,538],[831,538],[838,531],[843,523],[847,515],[850,510],[852,506],[854,500],[856,493],[857,486],[858,480],[858,476],[859,473],[859,472],[859,471],[859,470],[859,469],[859,468],[858,468],[857,466],[856,466],[853,464],[852,463],[851,462],[849,461],[848,460],[847,460],[845,459],[843,456],[841,454],[839,452],[834,450],[830,447],[824,444],[819,442],[815,441],[810,441],[805,439],[797,439],[788,438],[779,437],[768,437],[760,437],[751,437],[744,438],[740,439],[735,440],[729,442],[722,445],[714,448],[707,453],[699,457],[693,462],[689,465],[684,469],[680,472],[678,474],[676,476],[675,477],[674,478],[674,479],[674,480],[675,482],[678,483],[683,484],[688,484],[694,484],[702,484],[711,483],[719,482],[726,481],[729,480],[736,479],[742,478],[748,476],[752,474],[757,472],[759,471],[762,468],[764,467],[766,465],[767,463],[769,462],[769,460],[770,459],[771,456],[773,451],[774,448],[774,444],[775,441],[777,436],[778,433],[778,430],[779,428],[780,426],[781,424],[781,423],[783,422],[784,420],[786,418],[789,416],[793,414],[797,411],[799,410],[800,409],[803,408],[806,408],[809,407],[817,406],[825,406],[833,407],[842,409],[850,411],[856,413],[860,414],[862,414],[865,415],[871,416],[884,417],[897,420],[904,420],[905,420],[906,420],[908,420],[911,420],[917,420],[925,420],[936,420],[947,420],[961,420],[961,420],[974,420],[983,420],[991,420],[991,420],[998,420],[1006,419],[1016,419],[1027,419],[1037,419],[1046,419],[1054,419],[1062,419],[1068,419],[1073,419],[1076,419],[1079,419],[1080,419],[1083,419],[1086,419],[1088,419],[1091,419],[1094,419],[1097,419],[1101,419],[1103,419],[1106,419],[1107,419],[1108,419],[1109,419],[1110,419],[1109,419],[1108,419],[1107,419],[1106,419],[1105,419],[1105,418],[1106,417],[1108,416],[1110,415],[1112,415],[1115,414],[1117,414],[1118,413],[1120,412],[1123,411],[1128,410],[1130,409],[1132,409],[1133,409],[1134,409],[1135,409],[1136,409],[1137,409],[1138,409],[1139,409],[1140,409],[1141,409],[1141,409],[1130,410],[1116,411],[1107,411],[1099,411],[1088,411],[1074,410],[1045,405],[1011,400],[1011,400],[969,395],[931,388],[931,388],[892,381],[850,375],[824,372],[809,370],[795,369],[773,366],[742,363],[714,361],[688,358],[665,355],[646,355],[626,354],[611,353],[598,353],[587,352],[579,351],[574,351],[570,351],[567,351],[564,351],[562,351],[559,351],[557,351],[555,351],[553,351],[551,352],[549,353],[548,354],[545,356],[543,358],[542,360],[540,361],[540,362],[539,363],[533,369],[525,380],[519,388],[514,400],[509,415],[507,422],[505,432],[503,444],[500,457],[498,467],[496,475],[495,481],[494,489],[493,497],[490,515],[489,523],[487,530],[485,538],[485,538],[484,545],[483,551],[483,551],[482,557],[481,559],[481,561],[481,563],[480,566],[478,571],[476,574],[475,579],[473,582],[471,585],[469,587],[467,590],[466,592],[465,593],[463,594],[463,595],[462,595],[461,596],[461,597],[459,598],[457,601],[455,603],[453,605],[451,606],[449,607],[447,609],[445,610],[443,611],[440,612],[438,613],[436,613],[431,615],[427,617],[421,619],[415,622],[409,624],[403,627],[396,629],[389,632],[381,634],[374,635],[369,636],[364,636],[361,637],[359,637],[356,637],[353,638],[350,638],[349,638],[348,638],[346,637],[344,636],[342,633],[338,630],[333,626],[327,621],[321,615],[316,611],[311,607],[309,604],[305,601],[300,596],[297,591],[293,588],[289,583],[287,579],[284,575],[282,572],[281,569],[280,567],[279,566],[279,564],[278,563],[277,561],[276,559],[276,555],[276,554],[275,553],[275,552],[275,550],[274,550],[274,548],[274,547],[274,546],[274,545],[275,544],[276,543],[277,543],[278,542],[279,542],[280,542],[281,542],[279,543],[277,545],[274,547],[270,550],[267,551],[264,553],[259,554],[252,556],[247,557],[240,558],[236,558],[232,558],[227,558],[223,558],[220,558],[218,558],[216,557],[212,557],[208,555],[206,554],[204,553],[204,552],[203,552],[203,551],[202,551],[202,550],[201,549],[201,548],[200,548],[200,547],[200,546],[200,545],[200,544],[200,543],[200,541],[202,539],[203,537],[205,535],[207,533],[208,533],[208,532],[209,532],[209,531],[210,531],[211,530],[213,529],[215,527],[216,527],[218,525],[220,524],[223,522],[227,521],[230,518],[235,515],[238,513],[242,509],[244,507],[247,504],[248,503],[248,502],[249,502],[250,501],[250,498],[251,496],[251,493],[251,489],[251,486],[251,483],[250,480],[248,478],[246,476],[245,475],[242,474],[240,472],[237,471],[231,469],[227,468],[221,466],[214,465],[209,464],[203,464],[198,464],[193,464],[191,464],[189,465],[187,465],[185,466],[183,466],[181,467],[181,467],[180,467],[179,467],[179,468],[179,469],[179,470],[179,471],[179,473],[179,475],[181,478],[182,479],[183,480],[185,483],[189,484],[192,486],[196,486],[200,486],[204,486],[209,486],[212,486],[215,485],[220,484],[226,482],[233,479],[238,477],[243,474],[247,472],[249,471],[251,470],[253,468],[254,468],[255,467],[256,466],[258,464],[259,461],[261,459],[261,457],[263,454],[264,450],[264,449],[264,448],[265,448],[265,447],[265,446],[265,445],[265,444],[265,441],[265,439],[265,438],[265,436],[263,434],[262,431],[260,429],[258,428],[256,427],[256,427],[255,426],[253,426],[250,425],[247,424],[244,423],[243,423],[242,423],[240,423],[239,423],[238,423],[237,423],[237,424],[237,425],[239,427],[240,430],[243,434],[245,438],[248,440],[249,441],[250,443],[254,444],[254,444],[257,447],[259,448],[262,449],[265,450],[267,450],[269,450],[271,450],[274,450],[276,449],[278,447],[280,445],[284,441],[289,434],[294,427],[294,427],[300,418],[305,407],[311,397],[315,389],[319,380],[322,372],[324,366],[325,363],[326,358],[327,356],[327,354],[327,353],[327,351],[327,349],[327,346],[325,344],[324,341],[322,336],[320,333],[319,331],[318,329],[315,325],[313,321],[308,314],[307,312],[305,309],[302,307],[299,305],[297,304],[294,303],[291,302],[287,302],[282,302],[277,302],[272,302],[267,302],[259,305],[254,307],[250,309],[248,310],[246,311],[245,311],[244,312],[240,314],[237,316],[232,318],[229,320],[227,321],[224,322],[222,323],[221,324],[220,325],[220,326],[220,327],[223,329],[225,330],[227,330],[229,330],[230,330],[231,330],[233,330],[234,330],[236,329],[240,328],[243,325],[246,323],[261,313],[264,310],[267,309],[269,307],[272,304],[275,301],[278,297],[282,292],[285,289],[286,285],[289,281],[290,278],[292,275],[292,273],[292,272],[292,271],[292,270],[293,270],[293,269],[293,268],[293,267],[293,266],[292,265],[291,264],[290,264],[289,262],[287,261],[284,259],[282,259],[280,256],[276,255],[274,253],[272,252],[271,252],[269,251],[268,250],[266,249],[263,248],[259,246],[255,246],[251,245],[246,243],[242,242],[237,241],[234,241],[233,240],[231,240],[230,240],[229,240],[228,240],[228,241],[227,241],[227,242],[227,244],[227,246],[227,247],[227,248],[227,249],[227,250],[227,251],[227,252],[227,253],[227,254],[227,255],[227,256],[227,257],[227,258],[227,259],[227,260],[227,261],[227,262],[227,263],[227,265],[227,266],[227,268],[227,269],[227,270],[227,271],[227,272],[227,273],[227,274],[228,276],[229,276],[230,277],[231,277],[233,278],[235,279],[237,279],[239,279],[240,279],[242,279],[243,279],[244,279],[245,279],[246,279],[249,278],[251,277],[254,276],[255,275],[257,273],[259,273],[260,271],[262,269],[266,266],[270,263],[273,258],[276,255],[280,249],[282,244],[283,241],[285,237],[287,234],[289,227],[291,221],[293,214],[294,209],[295,203],[295,197],[296,194],[297,191],[298,188],[298,187],[298,186],[298,185],[298,184],[298,183],[298,182],[299,181],[299,180],[299,179],[299,178],[299,177],[298,176],[298,175],[299,177],[300,180],[302,182],[305,184],[307,188],[311,190],[313,193],[315,195],[318,196],[318,197],[319,197],[320,198],[320,199],[321,199],[322,199],[323,199],[324,199],[325,199],[326,199],[327,199],[328,199],[329,199],[330,198],[330,197],[331,196],[331,195],[331,194],[332,194],[332,193],[332,192],[332,191],[331,191],[330,190],[329,190],[328,190],[327,190],[325,190],[324,191],[321,194],[317,197],[313,201],[311,204],[308,207],[306,211],[303,216],[300,221],[298,225],[298,225],[296,230],[295,233],[293,236],[292,239],[292,241],[292,243],[292,244],[292,245],[292,246],[292,247],[292,248],[292,249],[293,250],[295,250],[298,251],[303,252],[307,252],[310,252],[315,251],[321,249],[325,247],[329,245],[333,243],[339,240],[345,236],[352,233],[357,230],[361,228],[363,226],[363,225],[364,225],[365,224],[365,223],[365,222],[365,220],[364,220],[364,219],[362,218],[361,217],[360,216],[357,215],[356,214],[355,214],[354,214],[351,214],[350,214],[348,214],[345,216],[342,217],[338,220],[335,222],[332,225],[330,227],[329,229],[326,232],[325,233],[324,235],[323,236],[323,237],[323,238],[323,240],[323,241],[324,243],[327,247],[330,250],[333,254],[336,255],[338,257],[341,259],[347,262],[353,264],[361,267],[367,269],[373,270],[378,272],[382,272],[385,273],[388,273],[391,273],[392,273],[394,273],[395,273],[396,273],[398,273],[399,273],[400,272],[401,271],[402,269],[402,268],[403,266],[405,262],[406,258],[408,255],[409,250],[409,246],[409,242],[409,239],[409,236],[409,234],[409,232],[409,229],[409,227],[409,224],[409,223],[409,222],[409,221],[409,220],[409,218],[407,216],[406,214],[405,213],[405,212],[404,212],[404,211],[402,210],[377,201],[375,201],[374,201],[372,201],[369,200],[368,200],[367,200],[366,200],[363,200],[361,200],[359,201],[357,202],[356,202],[354,203],[353,203],[350,205],[347,206],[344,208],[342,209],[340,211],[338,213],[335,214],[335,215],[334,216],[332,217],[331,219],[329,220],[328,222],[326,223],[324,225],[322,226],[320,228],[318,230],[317,231],[316,232],[315,234],[312,235],[310,238],[308,240],[305,241],[304,244],[302,245],[301,247],[300,249],[299,250],[298,251],[298,252],[297,255],[296,256],[294,258],[293,261],[292,264],[291,266],[290,268],[290,270],[289,271],[288,272],[288,274],[287,274],[287,275],[286,276],[285,277],[280,280],[279,281],[278,282],[277,282],[277,283],[276,283],[276,284],[276,285],[276,285],[278,284],[282,280],[290,275],[300,267],[311,259],[319,254],[329,248],[344,239],[373,224],[402,206],[437,188],[471,170],[505,154],[505,154],[539,138],[570,124],[603,112],[621,105],[635,101],[647,97],[661,91],[686,84],[1161,1],[1219,1],[1212,5],[1193,151],[1191,151],[1189,152],[1185,152],[1178,152],[1166,152],[1149,151],[1121,146],[467,125],[299,152],[294,154],[331,151],[344,150],[356,149],[369,149],[383,148],[396,148],[411,147],[424,147],[438,147],[452,147],[465,147],[477,147],[487,147],[498,147],[506,148],[514,148],[520,148],[524,149],[526,149],[528,149],[529,149],[530,149],[530,150],[531,151],[531,152],[531,154],[192,148],[190,141],[188,134],[186,128],[185,124],[184,117],[183,116],[182,114],[182,113],[181,112],[181,110],[181,108],[181,107],[181,106],[181,104],[181,103],[181,102],[181,101],[181,100],[181,99],[180,98],[180,97],[180,96],[179,95],[179,94],[178,93],[176,93],[175,92],[175,91],[173,91],[170,89],[168,89],[166,88],[164,87],[162,86],[159,86],[157,85],[152,83],[149,83],[146,82],[143,82],[140,81],[131,78],[126,77],[124,76],[122,75],[120,75],[118,75],[117,74],[116,73],[115,73],[114,73],[114,72],[113,72],[112,72],[111,72],[111,71],[111,71],[111,70],[111,69],[111,68],[111,66],[111,63],[111,56],[111,52],[111,48],[111,43],[111,37],[111,34],[111,31],[111,27],[111,23],[111,20],[110,18],[110,15],[109,11],[108,8],[107,6],[106,3],[105,0]]
	// var res = 20;
	// var bucket = {};
	// var max = 0;
	
	// for(var i=0;i<data.length;i++) {
		// var coor = [Math.round(data[i][0]/res), Math.round(data[i][1]/res)];

		// var pebble = coor.toString();
		// if(coor in bucket) {
			// bucket[pebble]++;
			// if (bucket[pebble] > max) {
				// max = bucket[pebble];
			// }
		// } else {
			// bucket[pebble] = 1;
		// }
	// }
	
	// for(pebble in bucket) {
		// var place = pebble.split(',');
		// place = [place[0] * res, place[1] * res]
		// var el = $('<div>').addClass('heat');
		// el.css('left', place[0]);
		// el.css('top', place[1]);
		// var x = parseInt(bucket[pebble]);
		// el.css("z-index", x);
		// var alpha = .4 + (.6 * (x/max));
		
		// x = Math.round(100 - (100 * (x / max)));
		
		// var cssStr = "hsla(" + x + ",90%,45%," + alpha + ")"
		// console.log(cssStr);
		
		// el.css('background',cssStr);
		// $('body').append(el);
		
	// }
	// var s = $("<style>").text(".heat { position:absolute;width:40px;height:40px;-webkit-filter:blur(15px); }");
	// $('head').append(s);

}

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	if (request.action == "heat") {
		console.log("map drawn");
		drawHeatmap();
		sendResponse({dom: "heatmap drawn"});
	} else if (request.action == "start") {
		init();
		sendResponse({dom: "init"});
	} else if (request.action == "stop") {
		record();
		sendResponse({dom: "done"});
	}
});

