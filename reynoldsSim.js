  // # THE FOLLOWING IS A 2-D VARIANT OF CRAIG REYNOLDS' BOID MODEL.
  // # Written by Gabriel Dell'Accio
  // # Algorithm inspired by Craig Reynold's BOID algorithm and Conrad Parker's BOIDs pseudocode at: 
  // # http://www.kfish.org/boids/pseudocode.html

  // # Overview:
  // #
  // #   Rules for swarming
  // #     1) Center of Mass: Boids are attracted to the center of the overall swarm.
  // #     2) Avoidance rule: Boids avoid collision with other boids by avoiding coming within
  // #        a certain distance of one another.
  // #     3) Match Velocity: Boids can sense the average velocity of the swarm and do their 
  // #        best to match it.
  // # 
  // #    GSI: Group Stability Index 
  // #     # This is an index developed by Baldessare and colleagues (2003) to measure the stability of a 
  // #     # swarm in their paper "Evolving mobile robots  able to display collective behaviors"



// Starting Variables
var nIndividuals = 50
var baseVelocity = 10
var spatialDistribution = 100
var centerStart = 400
var nSteps = 200
var bodySize = 8


// Array to hold the BOID swarm
var swarmArray = []

// Function to create a random gaussian distribution given a mean and standard deviation.
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

// Object that represents a boid.
function Boid(count, locx, locy, xvel, yvel) {
  this.index = count
  this.xPosition = locx
  this.yPosition = locy
  this.xvlc = xvel
  this.yvlc = yvel
  
}

// Helpper function for printing the location of a swarm.
function printBoidLocation(boid) {
  console.log("Boid loc: " +[boid.xPosition, boid.yPosition])
}

// 
function initializeSwarm(swarm) {
  for(h = 0; h < nIndividuals; h ++) {

    // var distribution = normalDist(centerStart, spatialDistribution);

    // Generate x,y coordinates from the random distribution we generated.
    // var tempX = distribution.ppf(Math.random());
    // var tempY = distribution.ppf(Math.random());
    var tempX = Math.randomGaussian(centerStart,spatialDistribution)
    var tempY = Math.randomGaussian(centerStart,spatialDistribution)

    var tempBoid = new Boid(h, tempX, tempY, baseVelocity, baseVelocity);
    
    swarm.push(tempBoid);

    // printBoidLocation(tempBoid)
  } 
  // console.log("Initialized Swarm:" + swarm)
  return swarm
}


function computeCartDist(x1,x2,y1,y2) {
  var a = x1 - x2 
  var b = y1 - y2 
  var c = Math.sqrt(a*a + b*b)
  return c
}

function calculateGroupDist(swarm) {
  var groupedDistance = 0
  for(i=0; i<nIndividuals; i++) {
    for(j=0;j<nIndividuals; j++) {
      var tempDist = computeCartDist(swarm[i].xPosition,swarm[j].xPosition,swarm[i].yPosition, swarm[j].yPosition);
      // console.log(tempDist)
      groupedDistance = groupedDistance + tempDist;
    } 
  }
  // console.log("Grouped distance: "+groupedDistance)
  return groupedDistance;
}

function calculateGSI(groupedDistancePrev,groupedDistanceNext) {
  // console.log("groupedDistancePrev: "+ groupedDistancePrev)
  // console.log("groupedDistanceNext: "+ groupedDistanceNext)
  var finalGSI = 1 - (((Math.abs(groupedDistancePrev - groupedDistanceNext)) / 4 ) / (nIndividuals*(nIndividuals-1)/2))
  // console.log(finalGSI)

  // console.log(finalGSI)
  return finalGSI
}

// Find the center of the swarm by finding the average x,y of the swarm.
function centerOfMass(boid, swarm) {
  var totalY = 0
  var totalX = 0
  for(t=0;t<nIndividuals;t++){
    totalX = totalX + swarm[t].xPosition
    totalY = totalY + swarm[t].yPosition
  }
  var averageX = totalX / nIndividuals
  var averageY = totalY / nIndividuals




  var centerMass = [((averageX - boid.xPosition)/100), ((averageY - boid.yPosition)/100)]

  // console.log("Center mass rule is: " + centerMass)

  return centerMass
}

function avoidRule(boid, swarm) {
  
  var correctedCourse = [0,0]

  for(it=0;it<nIndividuals;it++) {

    if(boid.index == it) { 

    } else {

      if((Math.abs(swarm[it].xPosition - boid.xPosition) < 100) && (Math.abs(swarm[it].yPosition - boid.yPosition) < 100)) {
        var currentPosition = [swarm[it].xPosition, swarm[it].yPosition]

        correctedCourse[0] = correctedCourse[0] - (currentPosition[0] - boid.xPosition)

        // console.log("Correction x: " + correctedCourse[0])
        correctedCourse[1] = correctedCourse[1] - (currentPosition[1] - boid.yPosition)

        // console.log("Correction y: " + correctedCourse[1])
      }
    }

  }
  

  correctedCourse = [correctedCourse[0]/nIndividuals, correctedCourse[1]/nIndividuals]
  // console.log("avoid rule: " + correctedCourse)
  return correctedCourse 
} 


function matchVelocity(cBoid, swarm) {
  var meanVelocityX = 0
  var meanVelocityY = 0

  for(m=0; m<nIndividuals;m++) {
    meanVelocityY = meanVelocityY + cBoid.yvlc
    meanVelocityX = meanVelocityX + cBoid.xvlc
  }
  meanVelocityX = meanVelocityX / nIndividuals
  meanVelocityY = meanVelocityY / nIndividuals

  var velocityCorrectionX = (meanVelocityX - cBoid.xvlc) / 8 
  var velocityCorrectionY = (meanVelocityY = cBoid.yvlc) / 8

  // console.log("velocityRule: " + [velocityCorrectionX, velocityCorrectionY])

  return [velocityCorrectionX,velocityCorrectionY]
}


function computeNextPos(cSwarm) {

  // console.log("This is the cswarm:")
  // console.log(cSwarm)

  var newSwarm = []

  for(k=0; k < nIndividuals; k++) {
    

    var tempBoid = new Boid(cSwarm[k].index, cSwarm[k].xPosition, cSwarm[k].yPosition, cSwarm[k].xvlc, cSwarm[k].yvlc);

    var centerMassRule = centerOfMass(tempBoid, cSwarm)
    var avoidanceRule = avoidRule(tempBoid, cSwarm)
    var velocityRule = matchVelocity(tempBoid, cSwarm)

    tempBoid.xvlc = tempBoid.xvlc + centerMassRule[0] + avoidanceRule[0] + velocityRule[0]
    tempBoid.yvlc = tempBoid.yvlc + centerMassRule[1] + avoidanceRule[1] + velocityRule[1] 

    var tempBoidPosX = tempBoid.xPosition + tempBoid.xvlc
    var tempBoidPosY = tempBoid.yPosition + tempBoid.yvlc

    // Create a temporary boid object to push to the new swarm object.
    tempBoid.xPosition = tempBoidPosX
    tempBoid.yPosition = tempBoidPosY

    newSwarm.push(tempBoid)
  }
  // Return the new swarm
  return newSwarm
}


function computeBehaviors(currentSwarm) {

    var prevDist = calculateGroupDist(currentSwarm)

    var nextSwarm = computeNextPos(currentSwarm)
    var nextDist = calculateGroupDist(nextSwarm)

    var temp = calculateGSI(prevDist,nextDist)

    return [temp, nextSwarm]
    // console.log(nextDist)
}

function step(swarmList) {
  
    computeResult = computeBehaviors(swarmList)

    var distLog = (computeResult[0])

    swarmState = computeResult[1]

  return [distLog, swarmState]
}


// console.log(swarmArray)


function stepper(swarm) {
  
  var theSwarm = swarm

  var gsiLog = []
  var swarmStateLog = []

  for(p=0;p<nSteps;p++) {
    console.log("step: "+p)
    var result = step(theSwarm)

    var theSwarm = result[1]
    // console.log("The swarm: " + swarm)
    gsiLog.push(result[0])
    swarmStateLog.push(theSwarm)
    // console.log("gsi: " + gsi)
  }

  return [gsiLog, swarmStateLog]
}

  
var swarmArray = initializeSwarm(swarmArray)
var result = stepper(swarmArray)
var arenaLog = result[1]
var roundOne = arenaLog[0]

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function displaySwarmProgression() {


  for(o = 0; o < arenaLog.length; o ++) {
      currentArena = arenaLog[o]
      var xList = []
      var yList = []
    for(h = 0; h < swarmArray.length; h++) {
      xList.push(currentArena[h].xPosition)
      yList.push(currentArena[h].yPosition)
    }


    var trace1 = {
      x: xList,
      y: yList,
      mode: 'markers',
      type: 'scatter'
    };

    var data = [trace1];

    Plotly.newPlot('myDiv', data);
    await sleep(1000);

  }

}

displaySwarmProgression();


module.exports.experimentResult = result;
// console.log()
// console.log(result)
// console.log()

// console.log(GSIresult)


/////////////////