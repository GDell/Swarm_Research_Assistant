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
var nIndividuals = 10
var baseVelocity = 10
var spatialDistribution = 100
var centerStart = 500
var nSteps = 20
var bodySize = 5

// Load the gaussian package in order to sample from normal 
// distributions.
var normalDist = require("gaussian")
var matterJS = require("matter-js")
var bodies = matterJS.Bodies

// Array to hold the BOID swarm
var swarmArray = []

// Object that represents a boid.
function boid(count, locx, locy, xvel, yvel) {
  this.index = count
  this.xPosition = locx
  this.yPosition = locy
  this.xvlc = xvel
  this.yvlc = yvel
  this.body = bodies.circle(locx, locy, bodySize, bodySize)
  
}

// Helpper function for printing the location of a swarm.
function printBoidLocation(boid) {
  console.log("Boid loc: " +[boid.xPosition, boid.yPosition])
}

// 
function initializeSwarm(swarm) {
  for(h = 0; h < nIndividuals; h ++) {

    var distribution = normalDist(centerStart, spatialDistribution);

    // Generate x,y coordinates from the random distribution we generated.
    var tempX = distribution.ppf(Math.random());
    var tempY = distribution.ppf(Math.random());

    var tempBoid = new boid(h, tempX, tempY, baseVelocity, baseVelocity);
    
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
        // console.log("Current Position for avoid rule: " + currentPosition)
        // console.log("Current Position for the boid: " + [boid.xPosition, boid.yPosition])
        // console.log((currentPosition[0] - boid.xPosition))
        // console.log((currentPosition[1] - boid.yPosition))

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
    

    var tempBoid = new boid(cSwarm[k].index, cSwarm[k].xPosition, cSwarm[k].yPosition, cSwarm[k].xvlc, cSwarm[k].yvlc);

    // console.log("NEW BOID")
    // console.log(tempBoid)
    var centerMassRule = centerOfMass(tempBoid, cSwarm)
    var avoidanceRule = avoidRule(tempBoid, cSwarm)
    var velocityRule = matchVelocity(tempBoid, cSwarm)

    tempBoid.xvlc = tempBoid.xvlc + centerMassRule[0] + avoidanceRule[0] + velocityRule[0]
    tempBoid.yvlc = tempBoid.yvlc + centerMassRule[1] + avoidanceRule[1] + velocityRule[1] 

    var tempBoidPosX = tempBoid.xPosition + tempBoid.xvlc
    var tempBoidPosY = tempBoid.yPosition + tempBoid.yvlc

    
    tempBoid.xPosition = tempBoidPosX
    tempBoid.yPosition = tempBoidPosY
    // console.log("NEW BOID AFTER CHANGE")
    // console.log(tempBoid)
    // console.log("Current ind:")
    // console.log(tempBoid)
    newSwarm.push(tempBoid)
    // cSwarm[i] = tempBoid
    // console.log("current individual after being moved: " + [tempBoid.xPosition, tempBoid.yPosition])
  }
  // console.log("THis is the new swarm:") 
  // console.log(newSwarm)
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
  



 
  // for(i=0;i<steps;i++) {

  
    computeResult = computeBehaviors(swarmList)

    // console.log(computeResult)

    // console.log("hello")


    // console.log("current gsi log: " + computeResult[0])


    var distLog = (computeResult[0])


    // console.log("swarmState: " + swarmState)

    swarmState = computeResult[1]
  // }
  // console.log(dis)
  return [distLog, swarmState]
}




var swarmArray = initializeSwarm(swarmArray)
// console.log(swarmArray)


function stepper(swarm) {
  
  var theSwarm = swarm

  var gsiLog = []
  var swarmStateLog = []

  for(p=0;p<nSteps;p++) {
    // console.log("step: "+p)
    var result = step(theSwarm)

    var theSwarm = result[1]
    // console.log("The swarm: " + swarm)
    gsiLog.push(result[0])
    swarmStateLog.push(theSwarm)
    // console.log("gsi: " + gsi)
  }


  return [gsiLog, swarmStateLog]
}





result = stepper(swarmArray)
console.log(result[0])

module.exports.experimentResult = result;
// console.log()
// console.log(result)
// console.log()

// console.log(GSIresult)


/////////////////