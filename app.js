//Load modules
var fs = require("fs")
var express = require('express')
var app = express()
var http = require("http");
var config = require('config');
var matter = 'matter.js'
var csvWriter = require('csv-write-stream')
var writer = csvWriter()
'use strict';
// const mongotocsv = require('mongo-to-csv');

// Connecting to Databletase
var mongoose = require('mongoose');
var mongoDB = 'mongodb://localhost:27017';
var MongoClient = require('mongodb').MongoClient;
mongoose.connect(mongoDB);
// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;
//Get the default connection
var db = mongoose.connection;


var Schema = mongoose.Schema;

var trialSchema = new Schema(
{
	trialName: {type: String, required: true, max:100},
	gsiLog: {type:String, required:true, max:5000}
}
);


//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Javscript loads
// var reynolds = require("./asocialReynolds.js");

// HTML page loads
var reynoldsBasicHTML = fs.readFileSync('./indexOriginal.html');
var reynoldsSimHTML = fs.readFileSync('./indexAsocial.html');
var reynoldsMatterPhysHTML = fs.readFileSync('./indexPhysics.html');


app.use("/", express.static(__dirname + '/public'));

app
	.get('/', function (request, response) {
	  var htmlRes =  reynoldsSimHTML;
		response.writeHead(200, {'Content-Type': 'text/html'});
		response.write(htmlRes)
		response.end();
	})
	.post('/', function (request,response) {

		var tempTrial = mongoose.model('trial', trialSchema);
		var dataTemp = "";
		var finalObj;

		request.on('data', function (chunk) {

			dataTemp = dataTemp + chunk
			finalObj = JSON.parse(dataTemp)

			var t = new tempTrial({
				trialName: finalObj.name,
				gsiLog: finalObj.GSIlog
			});


			t.save(function(err){
				if(err) {
					throw err;
				} else{
					console.log("Trial saved successfully")
				}
			});

			queryMongoDB("exampleTrial")
			// mongoDBtoCSV("exampleTrial")
			// console.log(t)
      // console.log('GOT DATA!');
    	});

	} )


	// MONGO DB functions
	function queryMongoDB(trialSearch) {
		var tempArr;
		MongoClient.connect(mongoDB, function(err, db) {
			  if (err) throw err;
			  var dbo = db.db();

			 var query = {trialName:trialSearch};
			  dbo.collection("trials").find(query).toArray(function(err, result) {
			    if (err) throw err;
			    // console.log(result);

			   	// Get the first GSI log in the DB with the trial name passed to this function (tiralSearch)  
		   		var GSIarr = result[0].gsiLog
		   		// Write the Data to a CSV 
		   		writeToCSV(GSIarr, "testFunc1.csv")
		
			    db.close();
			  });
			});
		
	}


	// Function to write the contents of an array to a CSV
	function writeToCSV(arrayContent, nameOfCSV) {
		var writer = csvWriter()
		writer.pipe(fs.createWriteStream(nameOfCSV))
		var tempArr = arrayContent.split(',')
	   	tempArr.forEach(function(element) {		  	
			writer.write({GSI: element})
		});
   		writer.end()
	}

	// .get('/asocial', function (request, response) {
	//   	var htmlRes =  reynoldsSimHTML;

	// 	response.writeHead(200, {'Content-Type': 'text/html'});

	// 	response.write(htmlRes)

	// 	response.end();
	// })
	// .get('/phys', function(request, response) {
	// 	var htmlRes =  reynoldsMatterPhysHTML;

	// 	response.writeHead(200, {'Content-Type': 'text/html'});

	// 	response.write(htmlRes)

	// 	response.end();
	// })
// // var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });\




var port = config.get('Server.port');
app.set('port', port);
var server = app.listen(port, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Server running: http://",host,port)
})

