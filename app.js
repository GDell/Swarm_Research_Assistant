//Load HTTP module
var http = require("http");
var reynolds = require("./reynoldsSim.js");
// // console.log("THIS IS REYN: " + reynolds.experimentResult[0])
// var matter = require('matter-js')
var matter = 'matter.js'


// module aliases
// var Engine = matter.Engine,
//     Render = matter.Render,
//     World = matter.World,
//     Bodies = matter.Bodies;


//Create HTTP server and listen on port 8000 for requests
http.createServer(function(request, response) {

	// Loads the GSI log 
	var currentResult = reynolds.experimentResult

	// The html response to the server request
	var htmlRes =  '<!doctype html> \
	 						<head> \
	 						<meta charset>   \
	 							<h1>Reynolds 2D BOID model</h1> \
	 						</head> \
	 						<body> \
	 						</body>\
	 						<script src="https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.12.0/matter.js"></script>\
	 						<script> \
							var Engine = Matter.Engine,\
							    Render = Matter.Render,\
							    World = Matter.World,\
							    Bodies = Matter.Bodies;\
							var engine = Engine.create();\
							var render = Render.create({\
							    element: document.body,\
							    engine: engine\
							});\
							var boxA = Bodies.rectangle(400, 200, 80, 80);\
							var boxB = Bodies.rectangle(450, 50, 80, 80);\
							var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });\
							World.add(engine.world, [boxA, boxB, ground]);\
							Engine.run(engine);\
							Render.run(render);\
	 						console.log('+currentResult[0]+') \
	 						</script> \
	 				</html>'

	response.writeHead(200, {'Content-Type': 'text/html'});

	response.write(htmlRes)
	response.end();

// Designates the port as 3000
}).listen(3000); 

console.log('server running at 127.0.0.1:3000')


