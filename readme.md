Usability Test For Chrome
===

### ** MAJOR BUGS **
- After starting a test, you must reload the current page in order to track that one. Otherwise, you will miss the data from the first page.
- Keyboard shortcuts are finicky

### Info:
This is a project for HCDE 417 AU13 at the University of Washington

This project is managed by Kyle Karpack, Mark Ribera, and Janelle Van Hofwegen

### Usage
- Click the icon in the browser to view the popup.
- Type the name for a test and click "Start Test" to begin
- RELOAD THE CURRENT PAGE (Bug to be fixed soon)
- Engage in the test. Feel free to navigate across pages
- Stop the test when you are done by clicking the same button you did to start it.


### Data Retrieval
- Option 1: Navigate to page that has been visited during the test. Open the dropdown and click the red link to draw a heatmap.
- Option 2: Inspect the popup and run the following code to view the tests in storage:

``` javascript
	chrome.storage.local.get('status', function(items) {
		console.log(items);
	});

```

