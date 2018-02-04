//Load HTTP module
var http = require("http");
var reynolds = require("./reynoldsSim.js");
// // console.log("THIS IS REYN: " + reynolds.experimentResult[0])
var matter = require('matter-js')

// module aliases
var Engine = matter.Engine,
    Render = matter.Render,
    World = matter.World,
    Bodies = matter.Bodies;


//Create HTTP server and listen on port 8000 for requests
http.createServer(function(request, response) {

	// Loads the GSI log 
	var currentResult = reynolds.experimentResult

	// The html response to the server request
	var htmlRes =  "<!doctype html> \
	 					<html > \
	 						<head> \
	 						<meta charset>   \
	 							<h1>Reynolds 2D BOID model</h1> \
	 						</head> \
	 						<body> \
	 							<p >"+currentResult[0]+"</p> \
	 						</body>\
	 						<script> \
	 							console.log("+currentResult[0]+") \
	 						</script> \
	 					</html>"

	response.writeHead(200, {'Content-Type': 'text/html'});

	response.write(htmlRes)
	response.end();

// Designates the port as 3000
}).listen(3000); 

console.log('server running at 127.0.0.1:3000')


