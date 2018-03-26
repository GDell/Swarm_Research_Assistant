//Load modules
var fs = require("fs")
var express = require('express')
var app = express()
var http = require("http");
var config = require('config');
var matter = 'matter.js'

// Javscript loads
// var reynolds = require("./asocialReynolds.js");

// HTML page loads
var reynoldsBasicHTML = fs.readFileSync('./indexOriginal.html');
var reynoldsSimHTML = fs.readFileSync('./indexAsocial.html');
var reynoldsMatterPhysHTML = fs.readFileSync('./indexPhysics.html');


app.use("/", express.static(__dirname + '/public'));

app
	// .get('/asocial', function (request, response) {
	//   	var htmlRes =  reynoldsSimHTML;

	// 	response.writeHead(200, {'Content-Type': 'text/html'});

	// 	response.write(htmlRes)

	// 	response.end();
	// })
	.get('/', function (request, response) {
	  	var htmlRes =  reynoldsSimHTML;

		response.writeHead(200, {'Content-Type': 'text/html'});

		response.write(htmlRes)

		response.end();
	})
	// .get('/phys', function(request, response) {
	// 	var htmlRes =  reynoldsMatterPhysHTML;

	// 	response.writeHead(200, {'Content-Type': 'text/html'});

	// 	response.write(htmlRes)

	// 	response.end();
	// })
// // var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });\
// //Create HTTP server and listen on port 8000 for requests
// http.createServer(function() {

// 	// Loads the GSI log 
// 	// var currentResult = reynolds.experimentResult

// 	// var N = 10

// 	// // List of all swarm configurations from step 0-nSteps
// 	// var arenas = currentResult[1]
// 	// // Swarm configuration at round 0
// 	// var firstRound = arenas[0]

// 	// The html response to the server request


// // Designates the port as 3000
// }).listen(3000); 



var port = config.get('Server.port');
app.set('port', port);
var server = app.listen(port, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Server running: http://",host,port)
})

// app.listen(3000, 'localhost', function () {
//   console.log('Example app listening on port 3000!')
// }) 



// options: {\
// 							        width: 1500,\
// 							        height: 700,\
// 							        showPosition: true\
// 							    }\
// console.log('server running at 127.0.0.1:3000')


