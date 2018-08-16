// Load modules
var fs = require("fs")
var express = require('express')
var app = express()
var http = require("http");
var config = require('config');
var matter = 'matter.js'
var csvWriter = require('csv-write-stream')
var writer = csvWriter()
'use strict';

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
	gsiLog: {type:String, required:true, max:5000},
	light: {type:String,  max:5000} ,
    alignment:  {type:String,  max:5000} ,
    attraction:  {type:String,  max:5000},
    avoidance: {type:String,  max:5000},
    collision: {type:String,  max:5000}
}
);


//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// HTML page loads
var reynoldsBasicHTML = fs.readFileSync('./indexOriginal.html');
var reynoldsSimHTML = fs.readFileSync('./swarmModel.html');
// var reynoldsMatterPhysHTML = fs.readFileSync('./indexPhysics.html');

var recentTrial = "";

app.use("/", express.static(__dirname + '/public'));

// Define how the server responds to different requests.
app
	.get('/', function (request, response) {
	  var htmlRes =  reynoldsSimHTML;
		response.writeHead(200, {'Content-Type': 'text/html'});
		response.write(htmlRes)
		response.end();
	})
	.get('/downloadGSI', function (request, response) {

		var str = './public/GSIdata/' + recentTrial +'.csv'
	  	var file = str
         // var file = fs.readFileSync('./public/GSIdata/exampleTrial.csv')
         response.download(file, recentTrial + '.csv');
         // response.end();
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
				gsiLog: finalObj.GSIlog,
				light: finalObj.lightLog,
		        alignment:  finalObj.alignLog,
		        attraction:  finalObj.attractionLog,
		        avoidance:  finalObj.avoidanceLog,
		        collision:  finalObj.collisionLog,
		        
			});

			// Keeps track of the most recent trial data
			recentTrial = ""+finalObj.name +""

			t.save(function(err){
				if(err) {
					throw err;
				} else{
					console.log("Trial saved successfully")
				}
			});

			// console.log(recentTrial)


			csvFromMongoDB(recentTrial)
			// mongoDBtoCSV("exampleTrial")
			// console.log(t)
   
    	});


	} )

	// Searches the Mongo Database for a given trial and downloads that trial's 
	// data as a csv file in the ./public/GSIdata/ folder.
	function csvFromMongoDB(trialSearch) {
		var tempArr;
		MongoClient.connect(mongoDB, function(err, db) {
			  if (err) throw err;
			  var dbo = db.db();

			  var query = {trialName:trialSearch};
			  dbo.collection("trials").find(query).toArray(function(err, result) {
			    if (err) throw err;

			    // console.log(result[0].alignment)
			   	// Get the first GSI log in the DB with the trial name passed to this function (tiralSearch)  
		   		var GSIarr = result[0].gsiLog + '\n'
		   		var lightarr =  result[0].light + '\n'
		        var alignmentarr =  result[0].alignment + '\n'
		        var attractionarr = result[0].attraction + '\n'
		        var avoidancearr = result[0].avoidance + '\n'
		        var collisionarr = result[0].collision + '\n'
		        // var postionArr = result[0].position + '\n'


		   	
		   		writeToCSV(GSIarr, lightarr, alignmentarr, attractionarr, avoidancearr,  collisionarr, trialSearch+".csv")
		   
		  
		
			    db.close();
			  });
		});
	}


	// Function to write the contents of an array to a CSV.
	function writeToCSV(gsiC, lightC, alignmentC, attractionC, avoidnaceC, collisionC, nameOfCSV) {
		var writer = csvWriter( {
			headers: ["GSI","ALIGN", "ATTRACT", "AVOID", "COLLISION"]
		})

		writer.pipe(fs.createWriteStream("./public/GSIdata/"+nameOfCSV))

		var behaveCollection = [gsiC, lightC, alignmentC, attractionC, avoidnaceC, collisionC]


		var index = 0
		
		behaveCollection.forEach(function(element) {
			behaveCollection[index] = element.split(',').join("\n")

			index = index +1
			
		})

		writer.write(behaveCollection)
		writer.end()	
	}




// Set the port and host to the server where the simulation can be reached 
// Currently configured to be served locally.
var port = config.get('Server.port');
app.set('port', port);
var server = app.listen(port, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Server running: http://",host,port)
})

