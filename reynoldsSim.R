
# THE FOLLOWING IS A 2-D VARIANT OF CRAIG REYNOLDS' BOID MODEL.
# Written by Gabriel Dell'Accio
# Algorithm inspired by Conrad Parker's Boid's pseudocode at: 
# http://www.kfish.org/boids/pseudocode.html

# Overview:
#   Rules for swarming
#     1) Center of Mass: Boids are attracted to the center of the overall swarm.
#     2) Avoidance rule: Boids avoid collision with other boids by avoiding coming within
#        a certain distance of one another.
#     3) Match Velocity: Boids can sense the average velocity of the swarm and do their 
#        best to match it.

# LIBRARIES:
library(ggplot2)

# ARENA PARAMETERS:
  # Variable to hold the x,y center coordinate of the arena. 
  xLength <- 2000.0
  yLength <- 2000.0

  centerCor <- rep(xLength/2,2)
# SWARM PARAMETERS:
  # number of individuals
  nIndividuals <- 100 
  swarmCohesion <- 0.5
  swarmAvoidance <- 0.5
  baseVelocity <- 20
  densitySensitivity <- 75
  spatialDistribution <- 100
  thetaDistribution <- 50
  step.iterations <- 200

  # velocityList <- vector("list", nIndividuals)
  # print(velocityList)

  xVelocity <- rep(10, nIndividuals)
  yVelocity <- rep(10, nIndividuals)

  # This function creates the arena.
  create.arena <- function(xLength, yLength) {
    
    # length of x plane 
    xLimit <- xLength 
    # Length of y plane
    yLimit <- yLength
    
    # temporary data frame that holds the data 
    # that creates the borders of the 2D arena. 
    arena.Data <<- data.frame(
      yWall = rep(1,yLimit),
      xWall = c(1:xLimit),
      xNorthWall = c(1:xLimit),
      yNorthWall = rep(yLimit,yLimit)
    )

    # Plot Arena Borders
    arena <- ggplot(data = arena.Data, aes(x=xWall,y=yWall))
    arena <- arena + geom_point() +  ylim(1,yLimit) + xlim(1,xLimit) + geom_point(aes(xNorthWall,yNorthWall)) + geom_point(aes(rep(1,xLimit),c(1:yLimit))) + geom_point(aes(rep(xLimit,xLimit),c(1:yLimit)))

    return(arena)
  }
  arenaSim <- create.arena(xLength, yLength)

  # This function helps initialize the swarm and arena using a data frame, arena.data, 
  # that stores information about the swarm and the arena. 
  initialize.swarm <- function(avoidance, spatial.distribution.factor,coordinateLocation) {
      arena.Data$index <<- c(1:nIndividuals)
      arena.Data$xPosition <<- rep(NA, xLength)
      arena.Data$yPosition <<- rep(NA, yLength)
      # arena.Data$theta <<- rep(NA, xLength)
      # velocityList <<- rep(baseVelocity, nIndividuals)
    
    # Create the x,y position of each individual in the swarm by drawing from a 
    # random normal distribution around a given coordinate location in the arena. 
    for(var in 1:nIndividuals) {
      # velocityList[] <- c(baseVelocity,baseVelocity)
      arena.Data$xPosition[var] <<- rnorm(1, mean=coordinateLocation[1], sd=spatial.distribution.factor + 50)
      arena.Data$yPosition[var] <<- rnorm(1, mean=coordinateLocation[2], sd=spatial.distribution.factor + 50)
      # arena.Data$theta[var] <<- rnorm(1, mean = 180, sd= theta.distribution.factor + 5)
    }
  }

  # Call the initialize function that creates teh arena.data data frame 
  # with all previously declared swarm and arena parameters.
  initialize.swarm(swarmAvoidance, spatialDistribution, centerCor)

  # Function that updates the current arena with the swarm's current location.
  display.swarm <- function() {
    return(arenaSim + geom_point(aes(arena.Data$xPosition, arena.Data$yPosition)))
  }

arenaSim <- display.swarm()
arenaSim

# GSI: functions for computing the group stability index
  # This function computes the distance between two x,y points in the 2D arena. 
  compute.cart.distance  <- function(x1,x2,y1,y2) {
    return(sqrt(((x1-x2)^2) + ((y1-y2)^2)) )
  }
  # This function calculates the total distance between all members of the flock. It returns the total distance between all individuals in one step of the arena.
  calculate.group.distance <- function() {
    groupedDistance <- 0
    for(var in 1:nIndividuals) {
      for(varTwo in 1:nIndividuals) {
         dist <- compute.cart.distance(arena.Data$xPosition[var], arena.Data$xPosition[varTwo], arena.Data$yPosition[var], arena.Data$yPosition[varTwo])
         groupedDistance <- groupedDistance + dist
      }
    }
    return(groupedDistance)
  }
  # This function takes in the previous time step's total group distance and the current time steps group distance to calculate the 
  # group stability over time.
  calculate.gsi <- function(groupedDistancePrev, groupedDistanceNext) {
    finalGsi <- 1 - (((abs(groupedDistancePrev - groupedDistanceNext)) / 4 ) / (nIndividuals*(nIndividuals-1)/2))
    return(finalGsi)
  }


# A function that returns the average x,y coordinate of the swarm.
find.center <- function() {

  totalX <- 0
  totalY <- 0


  for(var in 1:nIndividuals) {
    totalX <- totalX + arena.Data$xPosition[var] 
    totalY <- totalY + arena.Data$yPosition[var] 
  }

  averageX <- totalX / nIndividuals
  averageY <- totalY / nIndividuals

  centerMass <- c(averageX, averageY)

  return(centerMass)

}


# RULE 1: calculate the swarm's center of mass 
center.of.mass <- function(boid, count) {

  totalX <- 0
  totalY <- 0


  for(var in 1:nIndividuals) {
    totalX <- totalX + arena.Data$xPosition[var] 
    totalY <- totalY + arena.Data$yPosition[var] 
  }

  averageX <- totalX / nIndividuals
  averageY <- totalY / nIndividuals

  centerMass <- c((averageX - boid[1]/100 ), (averageY - boid[2]/100))

  # print(paste("center of mass: ", centerMass))
  return(centerMass)

}


# RULE 2: calculate the avoidance correction for a boid   
avoidance.rule <- function(boid, count) {

  correctedCourse <- c(0,0)

  for(var in 1:nIndividuals) {

    if(count != var) {

      if((abs(arena.Data$xPosition[var] - boid[1]) < 100) && (abs(arena.Data$yPosition[var] - boid[2]) < 100)) {
        b.position <- c(arena.Data$xPosition[var], arena.Data$yPosition[var])

        correctedCourse <- correctedCourse - (b.position - boid)
      } 


    }
  }

  # print(paste("corrected avoidance: ", correctedCourse))
  return(correctedCourse)
}

# RULE 3: calculate the match velocity correction for a boid
match.velocity <- function(boid, count) {

  meanVelocityX <- 0 
  meanVelocityY <- 0

  for(var in 1:nIndividuals) {
    meanVelocityX <- meanVelocityX + xVelocity[var]
    meanVelocityY <- meanVelocityY + yVelocity[var]  
  }


  meanVelocityX <- meanVelocityX / nIndividuals
  meanVelocityY <- meanVelocityY / nIndividuals

  velocityCorrectionX <- (meanVelocityX - xVelocity[count]) /8
  velocityCorrectionY <- (meanVelocityY - xVelocity[count]) /8


  return(c(velocityCorrectionX, velocityCorrectionY))
}
 
# This function steps the swarm one step using the the 3 behavior rules 
# written above. The input to this function, "simVersion", is either "reynolds" 
# or "asocial". 
compute.next.pos <- function() {

  for(var in 1:nIndividuals) {

      currentIndividualLoc <- c(arena.Data$xPosition[var], arena.Data$yPosition[var])
      
      # Rule 1
      centerMassRule <- center.of.mass(currentIndividualLoc, var)
      # Rule 2 
      avoidanceRule <- avoidance.rule(currentIndividualLoc, var)
      # Rule 3
      velocityRule <- match.velocity(currentIndividualLoc, var)
      
      

      currentIndividualLoc <- currentIndividualLoc + c(xVelocity[var],yVelocity[var])

      xVelocity[var] <<- xVelocity[var] + centerMassRule[1] + avoidanceRule[1] + velocityRule[1]
      yVelocity[var] <<- yVelocity[var] + centerMassRule[2] + avoidanceRule[2] + velocityRule[2]


      arena.Data$xPosition[var] <<- currentIndividualLoc[1]
      arena.Data$yPosition[var] <<- currentIndividualLoc[2]
  }

}



# This function steps the swarm x iterations and tracks the group stability of the
# swarm in each time step. 
time.stepper <- function(iterations) {

  gsiLog <- rep(0,iterations)

  # For i iterations ...
  for(i in 1:iterations) {
    
    # calculate total group distance at this time step 
    prevTotalDistance <- calculate.group.distance()

    # Compute new positons for each individual in the swarm.
    compute.next.pos()

    # Calculate the total group distance after moving the swarm.
    nextTotalDistance <- calculate.group.distance()

    # Calculate the change in group stability between the previous and current 
    # time step and log it in the gsiLog vector.
    gsiLog[i] <- calculate.gsi(prevTotalDistance, nextTotalDistance)

    # Display the swarm.
    plot(arena.Data$xPosition, arena.Data$yPosition)
    Sys.sleep(.09)
  }
  return(gsiLog)
}

finalGsi <- time.stepper(10)

plot(finalGsi)


