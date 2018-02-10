//Load HTTP module
var fs = require("fs")
var http = require("http");
var reynolds = require("./asocialReynolds.js");
var html = fs.readFileSync('./index.html');
// // console.log("THIS IS REYN: " + reynolds.experimentResult[0])
// var matter = require('matter-js')
var matter = 'matter.js'

// var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });\
//Create HTTP server and listen on port 8000 for requests
http.createServer(function(request, response) {

	// Loads the GSI log 
	// var currentResult = reynolds.experimentResult

	// var N = 10

	// // List of all swarm configurations from step 0-nSteps
	// var arenas = currentResult[1]
	// // Swarm configuration at round 0
	// var firstRound = arenas[0]

	// The html response to the server request
	var htmlRes =  html;

	response.writeHead(200, {'Content-Type': 'text/html'});

	response.write(htmlRes)

	response.end();


// Designates the port as 3000
}).listen(3000); 

// options: {\
// 							        width: 1500,\
// 							        height: 700,\
// 							        showPosition: true\
// 							    }\
console.log('server running at 127.0.0.1:3000')


