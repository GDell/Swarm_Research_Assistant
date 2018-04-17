// // # THE FOLLOWING IS A 2-D VARIANT OF CRAIG REYNOLDS' BOID MODEL.
// // # Written by Gabriel Dell'Accio
// // # Algorithm inspired by Conrad Parker's BOIDs pseudocode 
// // # and the P5.js flocking simulation example: 
// // # -- http://www.kfish.org/boids/pseudocode.html
// // # -- https://p5js.org/examples/simulate-flocking.html
// // # 
// // #


// Saves the sliding bar objects in the indexOriginal page as variables.
var lightSlider = document.getElementById("lightRange");
var alignSlider = document.getElementById("alignmentRange");
var avoidSlider = document.getElementById("avoidanceRange");
var attractSlider = document.getElementById("attractionRange")
var collisionSlider = document.getElementById("collisionRange");

// Sets the initial values of the behavior slide bars
var lightSetting = 50/100;
var alignSetting = 50/100;
var avoidSetting = 50/100;
var attractSetting = 50/100;
var collisionSetting = 50/10;

// Changes the strength value of a behavior when a slide bar is interacted with.
lightSlider.oninput = function() {
  lightSetting = this.value/100;
  console.log("Light attraction strength"+lightSetting);
}
alignSlider.oninput = function() {
  alignSetting = this.value/100;
  console.log("Alignment strength"+alignSetting);
}
avoidSlider.oninput = function() {
  avoidSetting = this.value/100;
  console.log("Social avoidance strength"+avoidSetting);
}
attractSlider.oninput = function() {
  attractSetting = this.value/100;
  console.log("Social attraction strength"+attractSetting)
}
collisionSlider.oninput = function() {
  collisionSetting = this.value/1.0;
  console.log("Collision strength"+collisionSetting)
}


// Starting Variables
var nIndividuals = 50;
var baseVelocity = 1;
var spatialDistribution = 175;
// Starting average location for the swarm.
var bodySize = 8;

// Size of the arena
var canvasWidth = 700;
var canvasHeight = 700;
// Cluster center for starting swarm location.
var centerStart = canvasHeight/2;

// Colors for the HTML canvas display
var backgroundColor = "#414f59"
var boidColor = "#99c2ff"


// The distance at which boids will begin attempting to avoid one another.
var avoidanceDistance = 50;

// Global variable to hold the current experiment's flock.
var flock; 

// Logs for keeping track of GSI history and behavior strength history over the course of the simulation.
var gsiLog = [];
var lightLog = [];
var alignmentLog  = [];
var attractionLog = [];
var avoidanceLog = [];
var collisionLog = [];
var currentPositionLog = []

// Boolean variables to keep track of what behaviors are to be
// implemented each step of the simulation. Turned on/off by check boxrs.
var simLight;
var simAttraction;
var alignentSim
var simLight;
var alignmentSim;
var simAttraction;
var simAvoidance;
var simCollision;

// boolean state variable to keep track of whether or not the simulation is currently paused.
var pauseState = true;

// Setup function runs once when the page is first loaded. 
function setup() {

  // Create a canvas in the canvas HTML div to display the swarm.
  createCanvas(canvasWidth, canvasHeight)

  // Intialize the simulation
  initialize()

}

// A looping function that is constantly running after the setup function is finished running.
function draw() {

  // Display the behavior strengths in HTML 
  document.getElementById("lightDisplayVal").innerHTML = lightSetting;
  document.getElementById("alignmentDisplayVal").innerHTML = alignSetting;
  document.getElementById("avoidanceDisplayVal").innerHTML = avoidSetting;
  document.getElementById("attractionDisplayVal").innerHTML = attractSetting;
  document.getElementById("collisionDisplayVal").innerHTML = collisionSlider.value/100;

  // Call the reset function if the reset button is pressed.
  document.getElementById("resetButton").onclick = function() {
      reset();
  }


  var buttonText = document.getElementById("pauseButton").innerHTML;

  //  Changes the pause button to the play button and 
  // vice versa if the button is pressed. Does the same for pausing/
  // unpausing the simulation.
  document.getElementById("pauseButton").onclick = function() {
      pauseState = !pauseState;
      if (pauseState == true) {
        //Play Button
        document.getElementById("pauseButton").innerHTML = "&#9658"
      } else if (pauseState == false) {
        //Pause Button
        document.getElementById("pauseButton").innerHTML = "&#9612&#9612"
      }
  }

  // Set the background color of the canvas.
  background(backgroundColor);


  // Un-comment in order to run only 800 time-steps per trial.
  // if (gsiLog.length > 800) {
  //   pauseState = true;
  //   if (pauseState == true) {
  //       //Play Button
  //       document.getElementById("pauseButton").innerHTML = "&#9658"
  //     } else if (pauseState == false) {
  //       //Pause Button
  //       document.getElementById("pauseButton").innerHTML = "&#9612&#9612"
  //   }
  // }



  if (!pauseState) {

    // Calculates the total distance between individuals in a flock.
    prior = calculateGroupDist(flock);

    // Step the flock
    flock.step();

    // Display the newly stepped flock
    flock.display();

    // Calculate the total distance between individauls in the flock
    post = calculateGroupDist(flock)

    // Calculate the GSI for the current time-step using the prior and post group distances.
    currentGSI = calculateGSI(prior,post)

    // Push the GSI to the GSI log or the current experiment.
    gsiLog.push(currentGSI)
    

    // If any of the behavior primitives were applied in this time-step, push the 
    // current strength of that behavior to a log.
    if(simLight) {
      lightLog.push(lightSetting);
    }
    if(simAttraction) {
      attractionLog.push(attractSetting);
    }
    if(simAvoidance) {
      avoidanceLog.push(avoidSetting);
    }
    if(alignmentSim) {
      alignmentLog.push(alignSetting);
    }
    if(simCollision) {
      collisionLog.push(collisionSetting);
    }
  }
 
  // Display the current flock. 
  flock.display();  
  // Display the current experiment's GSI log.
  displayGSIlog(gsiLog)

  // Rest the log to store the current position of the swarm.
  currentPositionLog = [];
}

      // function to initiaize the swarm, randomly distributed around the center of the 
      // canvas view.
      function initialize() {
        // Function to retrun a value from a normal distribution around
        // a mean and with a given standard deviation.
        Math.randomGaussian = function(mean, standardDeviation) {
           if (Math.randomGaussian.nextGaussian !== undefined) {
               var nextGaussian = Math.randomGaussian.nextGaussian;
               delete Math.randomGaussian.nextGaussian;
               return (nextGaussian * standardDeviation) + mean;
           } else {
               var v1, v2, s, multiplier;
               do {
                   v1 = 2 * Math.random() - 1; // between -1 and 1
                   v2 = 2 * Math.random() - 1; // between -1 and 1
                   s = v1 * v1 + v2 * v2;
               } while (s >= 1 || s == 0);
               multiplier = Math.sqrt(-2 * Math.log(s) / s);
               Math.randomGaussian.nextGaussian = v2 * multiplier;
               return (v1 * multiplier * standardDeviation) + mean;
           }
        };

        // Set the number of individuals in the swarm from user input.
        nIndividuals = prompt("Please enter the number of individuals to be included in the swarm: ", 25)
        // Create a new structure to hold this flock. 
        flock = new Flock()
        // Generate the starting swarm.
        for(var o = 0; o <nIndividuals; o++) {
          var tempX = Math.randomGaussian(centerStart,spatialDistribution)
          var tempY = Math.randomGaussian(centerStart,spatialDistribution)
          var tempXV = Math.randomGaussian(baseVelocity,1)
          var tempYV = Math.randomGaussian(baseVelocity,1)
          var newBoid = new Boid(o, tempX, tempY, tempXV, tempYV);
          flock.addBoid(newBoid);
        }

        // Reset all of the logs
        gsiLog = [];
        lightLog = [];
        alignmentLog  = [];
        attractionLog = [];
        avoidanceLog = [];
        collisionLog = [];
        positionLog = [];
        currentPositionLog = [];
      }


      // This function resets the swarm and GSI log while pausing the simulation.
      function reset() {
        // Initialize the swarm
        initialize();
        // Force pause the simulation
        if (pauseState == false) {
          document.getElementById("pauseButton").click()
        }
        // Display the newly initialized flock.
        flock.display();
        // Hide the download link.
        var buttonElement = document.getElementById("downloadButton");
        buttonElement.classList.add("hide");
      }

      // Create an empty array to hold all of the boids initialized in the swarm. 
      function Flock() {
        this.boids = [];
      }

      // Dispay each boid by calling its rend() function
      Flock.prototype.display = function() {
        for(var i =0; i < this.boids.length; i++) {
          this.boids[i].rend(this.boids)

        }
      }

      // To step the flock, step each individual Boid. 
      Flock.prototype.step = function() {
        for(var i =0; i < this.boids.length; i++) {
          this.boids[i].step(this.boids)
        }
      }
      // Function to add a boid to the flock objects list of boids
      Flock.prototype.addBoid = function(b) {
        this.boids.push(b)
      }

      Flock.prototype.locationArray = function() {
          tempArray = [];
          this.boids.forEach(function(element) {
            var currentPos = [element.position.x, element.position.y];
            tempArray.push(currentPos);
          })

          return(tempArray)
      }

      // Object that represents a boid.
      function Boid(count, locx, locy, xvel, yvel, aVal) {
        this.acceleration = createVector(0,0);
        this.index = count;
        this.position = createVector(locx,locy)
        this.velocity = createVector(xvel,yvel)
        this.r = 3.0;
        this.attractVal = aVal;
        this.maxspeed = 3;
        this.maxforce = 0.05;
        // this.body = Bodies.circle(xvel, yvel, bodySize, bodySize)
        // World.add(world, this.body);
      }

      // A function to step and individual boid
      Boid.prototype.step = function(boids) {
        // Step each boid
        this.flock(boids)
        // Update the boid
        this.update();

        // Check to see if the wrap box is checked.
        var simWrap = document.getElementById('wrapCheckBox').checked;
        if(simWrap) {
          this.borders();
        }
        
      }

      // Renders a boid on the HTML canvas
      Boid.prototype.rend = function(boids) {        
        this.render();
      }

      // Applys acceleration to a BOID
      Boid.prototype.applyForce = function(force) {
        this.acceleration.add(force)
      }

      // Applys force from the currenlty activated behaviors to each individual in the swarm.
      Boid.prototype.flock = function(boids) {
        // Place the center of attraction (the light source) in the center of the arena.
        var lightAttraction = this.attraction(createVector(canvasWidth/2, canvasHeight/2))
        // Apply the behaviors
        var collision = this.collide(boids);
        var alignment = this.align(boids);
        var attraction = this.cohesion(boids)
        var avoidance = this. avoidance(boids, avoidanceDistance)

        // Check to see which behaviors are checked.
        simLight = document.getElementById('lightCheckBox').checked;
        alignmentSim = document.getElementById('alignCheckBox').checked;
        simAttraction = document.getElementById('attractionCheckBox').checked;
        simAvoidance = document.getElementById('avoidanceCheckBox').checked;
        simCollision = document.getElementById('collisionCheckBox').checked;
      
        // Weight of the attraction force by behavior strength
        lightAttraction.mult(lightSetting)
        collision.mult(collisionSetting)
        attraction.mult(attractSetting)
        avoidance.mult(avoidSetting)
        alignment.mult(alignSetting)

        // If the behavior is activated, apply the force.
        if(simLight){
          this.applyForce(lightAttraction)
        } 
        if (alignentSim){
          this.applyForce(alignment)
        } 
        if (simAttraction) {
          this.applyForce(attraction)
        }
        if (simAvoidance) {
          this.applyForce(avoidance)
        } 
        if (simCollision) {
          this.applyForce(collision)  
        }

      }

      // Update a boids velocity, position, and acceleration
      Boid.prototype.update = function() {
        this.velocity.add(this.acceleration)
        // this.velocity.limit(this.maxspeed);
        this.position.add(this.velocity);
        this.acceleration = createVector(0,0)
      }

      // Attraction behavior primitive
      Boid.prototype.attraction  = function(target) {
        var desired = p5.Vector.sub(target, this.position)
        // Normalize desired and scale to maximum speed
        desired.normalize();
        desired = desired.mult(this.maxspeed);
        // Steering = Desired minus Velocity
        var steer = p5.Vector.sub(desired, this.velocity);
        steer.limit(this.maxforce);  // Limit to maximum steering force
        return steer;
      }

      // Collision bejavior primitive.
      Boid.prototype.collide = function(boids) {
        var desiredseparation = 7;
        var steer = createVector(0,0);
        var count = 0;
        // For every boid in the system, check if it's too close
        for (var i = 0; i < boids.length; i++) {
          var d = p5.Vector.dist(this.position,boids[i].position);
          // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
          if ((d > 0) && (d < desiredseparation)) {
            // Calculate vector pointing away from neighbor
            var diff = p5.Vector.sub(this.position,boids[i].position);
            diff.normalize();
            diff.div(d);        // Weight by distance
            steer.add(diff);
            count++;            // Keep track of how many
          }
        }
        // Average -- divide by how many
        if (count > 0) {
          steer.div(count);
        }

        // As long as the vector is greater than 0
        if (steer.mag() > 0) {
          // Implement Reynolds: Steering = Desired - Velocity
          steer.normalize();
          steer.mult(this.maxspeed);
          steer.sub(this.velocity);
          steer.limit(this.maxforce);
        }
        return steer;
      }

      Boid.prototype.avoidance = function(boids, sep) {
        var desiredseparation = sep;
        var steer = createVector(0,0);
        var count = 0;
        // For every agent in the population
        for (var i = 0; i < boids.length; i++) {
          var d = p5.Vector.dist(this.position,boids[i].position);
          // If another boid is too close .....
          if ((d > 0) && (d < desiredseparation)) {
            // Calculate a vector pointing away 
            var diff = p5.Vector.sub(this.position,boids[i].position);
            diff.normalize();
            diff.div(d);        // Weight by distance
            steer.add(diff);
            count++;            // Keep track of how many
          }
        }
        // Average -- divide by how many
        if (count > 0) {
          steer.div(count);
        }

        // As long as the vector is greater than 0
        if (steer.mag() > 0) {
          // Implement Reynolds: Steering = Desired - Velocity
          steer.normalize();
          steer.mult(this.maxspeed);
          steer.sub(this.velocity);
          steer.limit(this.maxforce);
        }
        return steer;
      }

      // Align behavior primitive. Causes boids to align to boids closest to it within 600 arbitrary units (neighbordist)
      Boid.prototype.align = function(boids) {
        var neighbordist = 600;
        var sum = createVector(0,0);
        var count = 0;
        for (var i = 0; i < boids.length; i++) {
          var d = p5.Vector.dist(this.position,boids[i].position);
          if ((d > 0) && (d < neighbordist)) {
            sum.add(boids[i].velocity);
            count++;
          }
        }
        if (count > 0) {
          sum.div(count);
          sum.normalize();
          sum.mult(this.maxspeed);
          var steer = p5.Vector.sub(sum,this.velocity);
          steer.limit(this.maxforce);
          return steer;
        } else {
          return createVector(0,0);
        }
      }

      //  A function that steers a boid in a particular direction or target.
      Boid.prototype.seek = function(target) {
        var desired = p5.Vector.sub(target,this.position);  // A vector pointing from the location to the target
        // Normalize desired and scale to maximum speed
        desired.normalize();
        desired.mult(this.maxspeed);
        // Steering = Desired minus Velocity
        var steer = p5.Vector.sub(desired,this.velocity);
        steer.limit(this.maxforce);  // Limit to maximum steering force
        return steer;
      }

      // Cohesion behavior primitive. Causes Boids to be attracted towards Boids closest to it within 600 arbitraty units.
      Boid.prototype.cohesion = function(boids) {
        var neighbordist = 600;
        var sum = createVector(0,0);   // Start with empty vector to accumulate all locations
        var count = 0;
        for (var i = 0; i < boids.length; i++) {
          var d = p5.Vector.dist(this.position,boids[i].position);
          if ((d > 0) && (d < neighbordist)) {
            sum.add(boids[i].position); // Add location
            count++;
          }
        }
        if (count > 0) {
          sum.div(count);
          return this.seek(sum);  // Steer towards the location
        } else {
          return createVector(0,0);
        }
      }

      // Render's the BOID swarm on the canvas the canvas
      Boid.prototype.render = function() {
        // Find the boid's heading
        var theta = this.velocity.heading() + radians(90)
        fill(400)
        stroke(200)
        push()
        translate(this.position.x, this.position.y);
        rotate(theta);
        beginShape();
        vertex(0, -this.r*2);
        vertex(-this.r, this.r*1);
        vertex(this.r, this.r*1);
        endShape(CLOSE);
        pop();
      }

      // This function causes Boids to wrap aroud the Canvas view.
      Boid.prototype.borders = function() {
        if (this.position.x < -this.r)  this.position.x = width +this.r;
        if (this.position.y < -this.r)  this.position.y = height+this.r;
        if (this.position.x > width +this.r) this.position.x = -this.r;
        if (this.position.y > height+this.r) this.position.y = -this.r;
      }

      // Helper function for printing the location of a swarm.
      function printBoidLocation(boid) {
        console.log("Boid loc: " +[boid.xPosition, boid.yPosition])
      }

      // Computes the cartesian distance between two x,y coordinates
      function computeCartDist(x1,x2,y1,y2) {
        var a = x1 - x2 
        var b = y1 - y2 
        var c = Math.sqrt(a*a + b*b)
        return c
      }

      // Calculates the total distance between all members in the swarm.
      function calculateGroupDist(swarm) {
        var groupedDistance = 0;

        for(i=0; i<nIndividuals; i++) {
          for(j=0;j<nIndividuals; j++) {
            var tempDist = computeCartDist(swarm.boids[i].position.x,swarm.boids[j].position.x,swarm.boids[i].position.y, swarm.boids[j].position.y);
            groupedDistance = groupedDistance + tempDist;
          } 
        }
       
        return groupedDistance;
      }

      // This function implements Baldassare et al.'s group stability index 
      // which measures the stability of the swarm in relation to the change in distance between all members of the swarm
      function calculateGSI(groupedDistancePrev,groupedDistanceNext) {
        var finalGSI = 1 - (((Math.abs(groupedDistancePrev - groupedDistanceNext)) / 4 ) / (nIndividuals*(nIndividuals-1)/2))
        return finalGSI
      }


      // This function plots the GSI log for the current trial to the right of the canvas view. 
      async function displayGSIlog(log) {

        var logLength = log.length;

        var xList = []
        var yList = []

        // Logic that plots up to the last 100 trials in the current experiment.
        if (logLength>100) {
          for (var f = logLength - 100; f < logLength; f++) {
            if(f > (logLength - 100) ){
              xList.push(f)
              yList.push(log[f])
            }
          }        
        } else {
          for (var f = 0; f < logLength; f++) {
        
              xList.push(f)
              yList.push(log[f])
        
          }
        }


        // Specifies the GSI plot
        var trace1 = {
          x: xList,
          y: yList,
          mode: 'markers',
          type: 'scatter'
        };

        var data = [trace1];

        var layout = {
          xaxis: {
            title: "Time Step"
          },
          yaxis: {
            title: "Group Stability",
            range: [0,1]
          }
        };        

        // Creates the plot
        Plotly.newPlot('myDiv', data, layout);

      }

      // Function that is called when the user pressed the "Store Data" button. This
      // triggers a database insertion and creates a link to allow the use to download the current 
      // trial's GSI log as a CSV.
      function downloadCSV(args, light, alignz, attract, avoid, collide) { 
                var nameTrial = prompt("Please enter the number of individuals to be included in the swarm: ", "exampleTrial")

                if (nameTrial != null) {
                  var data = {};
                  data.name = nameTrial;
                  data.GSIlog = args;  
                  data.lightLog = light;
                  data.alignLog  = alignz;
                  data.attractionLog = attract;
                  data.avoidanceLog = avoid;
                  data.collisionLog = collide;
                
                   // Send a trial Data that will create a DB entry and creat a csv of the most recent trial
                  $.ajax({
                      type: 'POST',
                      data: JSON.stringify(data),
                      contentType: 'application/json',
                      url: 'http://localhost:3000/',            
                      success: function(data) {
                                  console.log('success');
                                  
                      }
                  });

                  // Create a download link for the csv for this trial
                  createDownloadLink(nameTrial)
                }
                
      }      

        // Creates a link next to the reset swarm button that permits a user to
        // download the current trial's GSI
      function createDownloadLink(nameLink) {
        var buttonElement = document.getElementById("downloadButton");
        var linkDownload = document.getElementById("linkD");
        buttonElement.classList.remove("hide");
        // var GSIlink = document.getElementById("GSIdownloadLink");
        linkDownload.innerHTML = nameLink+".csv"; 
        linkDownload.href = "http://localhost:3000/downloadGSI"
      } 