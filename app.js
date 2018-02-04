//Load HTTP module
var http = require("http");
var reynolds = require("./reynoldsSim.js");
// var express = require('express' 4.16.2)
// var app = express()

// // console.log("THIS IS REYN: " + reynolds.experimentResult[0])
// var matter = require('matter-js')

// // module aliases
// var Engine = matter.Engine,
//     Render = matter.Render,
//     World = matter.World,
//     Bodies = matter.Bodies;



// function handler(req, res) {
	
// 		html = reynolds.experimentResult
// 	// if(req.method == "GET") {
// 		var result = '<!doctype html> \
// <html lang="en"> \
// <head> \
//     <meta charset="UTF-8">  \
//     <title>Form Calculator Add Example</title> \
// </head> \
// <body> \
//       <p >'+html[0]+'</p> \
// </body> \
// </html>';

// 		// res.setHeader('Content-Type', 'text/html');
// 		// res.writeHead(200);
// 		res.write("SHIT");
// 		res.end();
// 	// }
// }





// //Create HTTP server and listen on port 8000 for requests
// http.createServer(handler).listen(8000, function (err) {


// 	if(err) {
// 		console.log("Error in starting the http server...")
// 	} else {
// 		console.log("Server running at http://127.0.0.1:8000/")
// 	}


// });ss
//Create HTTP server and listen on port 8000 for requests
http.createServer(function(request, response) {

	htmlRes = reynolds.experimentResult
	// if(req.method == "GET") {
	// var result = '<!doctype html> <html lang="en"> <head> <meta charset="UTF-8">  <title>Form Calculator Add Example</title> </head> <body> <p >'+htmlRes[0]+'</p> </body> </html>';
	// response.(htmlRes)
	response.writeHead(200, {'Content-Type': 'text/javascript'});
	// res.write('HELLO WORLD\n');

	response.write(console.log(htmlRes))
	response.end();


}).listen(3000); 

console.log('server running at 127.0.0.1:3000')


