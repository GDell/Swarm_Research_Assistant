
# The following is a 2D variant of the Reynolds Boid model.
# LIBRARIES:
library(ggplot2)

# ARENA PARAMETERS:
# Set if equal height and width
size <- 1000.0

centerCor <- rep(size/2,2)

xVal <- size
yVal <- size


# Set swarm parameters.
nIndividuals <- 100 
swarmCohesion <- 0.5
swarmAvoidance <- 0.5
baseMovementRate <- 4
densitySensitivity <- 75
spatialDistribution <- 100
thetaDistribution <- 50
step.iterations <- 200

# Create the arena using the arena.data frame.
create.arena <- function(xLength, yLength) {
  xLimit <- xLength 
  yLimit <- yLength
  
  arena.Data <<- data.frame(
    yWall = rep(1,yLimit),
    xWall = c(1:xLimit),
    xNorthWall = c(1:xLimit),
    yNorthWall = rep(yLimit,yLimit)
  )

  # Creating Arena Borders
  arena <- ggplot(data = arena.Data, aes(x=xWall,y=yWall))
  arena <- arena + geom_point() +  ylim(1,yLimit) + xlim(1,xLimit) + geom_point(aes(xNorthWall,yNorthWall)) + geom_point(aes(rep(1,xLimit),c(1:yLimit))) + geom_point(aes(rep(xLimit,xLimit),c(1:yLimit)))

  return(arena)
}
arenaSim <- create.arena(xVal, yVal)

# Initialize the swarm population using mean values.
initialize.swarm <- function(cohesion, avoidance, spatial.distribution.factor, theta.distribution.factor ,coordinateLocation) {
    arena.Data$index <<- c(1:nIndividuals)
    arena.Data$swarm.cohesion <<- rep(swarmCohesion,nIndividuals)
    arena.Data$swarm.avoidance <<- rep(swarmAvoidance,nIndividuals)
    arena.Data$xPosition <<- rep(NA, xVal)
    arena.Data$yPosition <<- rep(NA, yVal)
    arena.Data$theta <<- rep(NA, xVal)
  
  for(var in 1:nIndividuals) {
    arena.Data$xPosition[var] <<- rnorm(1, mean=coordinateLocation[1], sd=spatial.distribution.factor + 50)
    arena.Data$yPosition[var] <<- rnorm(1, mean=coordinateLocation[2], sd=spatial.distribution.factor + 50)
    arena.Data$theta[var] <<- rnorm(1, mean = 180, sd= theta.distribution.factor + 5)
  }
}

# Display the swarm in the 2D arena.
initialize.swarm(swarmCohesion, swarmAvoidance, spatialDistribution, thetaDistribution, centerCor)

# Function that updates the current arena with the swarm's current location.
display.swarm <- function() {
  return(arenaSim + geom_point(aes(arena.Data$xPosition, arena.Data$yPosition)))
}

arenaSim <- display.swarm()
arenaSim


# Function to determine an individual's sensed density values.
determine.density <- function(senseHeight, senseWidth, locationX, locationY, thetaGiven) {

  nTotalPositions <- ((senseHeight * senseWidth) * 4)

  startX <- locationX - senseWidth
  # print(paste("Start x: ", startX))

  endX <- locationX + senseWidth
  # print(paste("End x: ", endX))

  startY <- locationY - senseHeight
  endY <- locationY + senseHeight

  numberOfIndividualsPresent <- 0


  count <- 1

  checkCount <- 1

  tempLocalThetas <- c()


  for(indOne in 1:nIndividuals) {

    if((arena.Data$xPosition[count] <= endX) && (arena.Data$xPosition[count] >= startX)) {

      # print(paste("xposition: ", arena.Data$xPosition[count]))

      if((arena.Data$yPosition[count] <= endY) && (arena.Data$yPosition[count] >= startY)) {
        numberOfIndividualsPresent <- numberOfIndividualsPresent + 1
      

        tempLocalThetas[checkCount] <- arena.Data$theta[count]
        checkCount <- checkCount + 1
      }
    }

    count <- count + 1
  }



  finalDensity <- ((numberOfIndividualsPresent / nTotalPositions)  + (numberOfIndividualsPresent/nIndividuals))

  # print(tempLocalThetas)

  if(length(tempLocalThetas) > 0) {
    averageTheta <- mean(tempLocalThetas)
    } else {
    averageTheta <- arena.Data$theta[thetaGiven]
  }
 
  

  returnList <- c(finalDensity, averageTheta)
  return(returnList)

}

# Determines the density value for each agent in the swarm.
find.Neighbors <- function() {
  count <- 1
  for (var in 1:nIndividuals) {
    result <- determine.density(densitySensitivity,densitySensitivity,arena.Data$xPosition[count], arena.Data$yPosition[count], arena.Data$theta[count])
    # print(result)
    arena.Data$Density[count] <<- result[1] 
    arena.Data$avgLocalTheta[count] <<- result[2]
    count <- count + 1
  }
}
find.Neighbors()

densityTotal <- 0
tempDensityArray <- c()

for(var in 1:nIndividuals) {
  densityTotal <- densityTotal + arena.Data$Density[var] 
  tempDensityArray[var] <- arena.Data$Density[var] 
}

meanDensity <- (densityTotal / nIndividuals) 
sdDensity <- (sd(tempDensityArray)) 

# Function used to determine how far from the mean an individuals density score is.
sdDistance <- function(value, mean, sd) {
  temp <- abs(mean - value) %/% sd
  return(temp)
}

# Assign individual density values.
determine.density.distance <- function(mean, sd) {
 for (var in 1:nIndividuals){
   arena.Data$DensityDistance[var] <<- sdDistance(arena.Data$Density[var], mean, sd)
 }
}

determine.density.distance(meanDensity, sdDensity)

# Function for converting degrees to radians, used in computing the new X,Y coor for each agent.
degreeToRadians <- function(angle) {
  return(pi * angle / 180);
} 


# HEATMAP GENERATION
# Assign a value to a location given how far away it is from a given center point. The farther the smaller the value.
assign.location.value <- function(center, currentLocation, distribution.type) {
  rowDiff <- abs(center[1] - currentLocation[1])
  columnDiff <- abs(center[2] - currentLocation[2])
  totalDifference <- rowDiff + columnDiff
  scaledDifference <- 1 - (distribution.type(totalDifference)/distribution.type(center[1] * 2))
  return(scaledDifference)
}
# Distribution of values around the center of the arena.
value.distribution <- function(x) {
  return(x^2)
}
# Generate heat map 
create.heatmap <- function(arena.length, arena.width) {
  centerArena <- c(arena.length/2, arena.width/2)
  arena.heat.map <- matrix(nrow = arena.length, ncol = arena.width)
  for(i in 1:arena.length) {
    for(j in 1:arena.width) {
      currentIndex <- c(i,j)
      arena.heat.map[i,j] <- assign.location.value(centerArena, currentIndex, value.distribution)
    }
  }
  return(arena.heat.map)
}
# heat.map <- create.heatmap(xVal,yVal)

# Visualize the heat map
# image(heat.map)

# GSI: group stability index
compute.cart.distance  <- function(x1,x2,y1,y2) {
  return(sqrt(((x1-x2)^2) + ((y1-y2)^2)) )
}


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

calculate.gsi <- function(groupedDistancePrev, groupedDistanceNext) {

  finalGsi <- 1 - (((abs(groupedDistancePrev - groupedDistanceNext)) / 4 ) / (nIndividuals*(nIndividuals-1)/2))

  return(finalGsi)
}



return.new.theta <- function(avgTheta) {


  result <- rnorm(1, avgTheta, 1)

  if (result > 360.0) {
    result <- 359
  } else if (result < 0.0) {
    result <- 1
  }

  return(result)

}


determine.angle.center <- function(var) {

  xCenter <- centerCor[1]
  yCenter <- centerCor[2]

  xInd <- arena.Data$xPosition[var]
  yInd <- arena.Data$yPosition[var]

  m <- ( yInd - yCenter ) / ( xInd - xCenter)

  thetaToCenter <- atan(m) 

  return(thetaToCenter)

}



# Computes the next x,y coor for var individual in the swarm based on its density reading.
compute.nextPos <- function(var, simulation) {

  if (simulation == "reynoldsOriginal") {

    if ((arena.Data$DensityDistance[var]) == 0) {
        movementRate <- baseMovementRate/3
    } else if (arena.Data$DensityDistance[var] == 1) {
        movementRate <- baseMovementRate
    } else if (arena.Data$DensityDistance[var] == 2) {
        movementRate <- baseMovementRate + 2
    } else { 
        movementRate <- baseMovementRate + 4
    }

    newTheta = return.new.theta(arena.Data$avgLocalTheta[var])
     
    newX = arena.Data$xPosition[var] + (movementRate * cos(degreeToRadians(arena.Data$theta[var])))
    newY = arena.Data$yPosition[var] + (movementRate * sin(degreeToRadians(arena.Data$theta[var])))


    ## Collision with walls
    if((newX >= size) || (newX <= 0)) {
      arena.Data$theta[var] <<- abs(180 - arena.Data$theta[var]) 
      newX = arena.Data$xPosition[var] + (movementRate * cos(degreeToRadians(arena.Data$theta[var])))
    } else {
      newX = arena.Data$xPosition[var] + (movementRate * cos(degreeToRadians(arena.Data$theta[var])))
    } 
  
    if((newY >= size) || (newY <= 0)) {
      arena.Data$theta[var] <<- abs(180 - arena.Data$theta[var]) 
      newY = arena.Data$yPosition[var] + (movementRate * sin(degreeToRadians(arena.Data$theta[var])))
    } else {
      newY = arena.Data$yPosition[var] + (movementRate * sin(degreeToRadians(arena.Data$theta[var])))
    }    

    nextPos <- c(newX, newY, newTheta)


  } else if (simulation == "reynoldsAsocial") {

    xloc <- arena.Data$xPosition[var]
    ylox <- arena.Data$yPosition[var]


    newTheta <- return.new.theta(determine.angle.center(var))

    # Distance from center of the arena determines movement rate.
    distCenter <-  compute.cart.distance(arena.Data$xPosition[var], size/2, arena.Data$yPosition[var], size/2)

    if (distCenter < size/4) {
        movementRate <- baseMovementRate/3
    } else if (distCenter > size/4 && distCenter < size/3) {
        movementRate <- baseMovementRate
    } else if (distCenter > size/3 && distCenter < size/2) {
        movementRate <- baseMovementRate + 2
    } else {
        movementRate <- baseMovementRate + 6
    }
     
    newX = arena.Data$xPosition[var] + (movementRate * cos(degreeToRadians(arena.Data$theta[var])))
    newY = arena.Data$yPosition[var] + (movementRate * sin(degreeToRadians(arena.Data$theta[var])))


    ## Collision with walls
    if((newX >= size) || (newX <= 0)) {
      arena.Data$theta[var] <<- abs(180 - arena.Data$theta[var]) 
      newX = arena.Data$xPosition[var] + (movementRate * cos(degreeToRadians(arena.Data$theta[var])))
    } else {
      newX = arena.Data$xPosition[var] + (movementRate * cos(degreeToRadians(arena.Data$theta[var])))
    } 
    ## Collision with walls
    if((newY >= size) || (newY <= 0)) {
      arena.Data$theta[var] <<- abs(180 - arena.Data$theta[var]) 
      newY = arena.Data$yPosition[var] + (movementRate * sin(degreeToRadians(arena.Data$theta[var])))
    } else {
      newY = arena.Data$yPosition[var] + (movementRate * sin(degreeToRadians(arena.Data$theta[var])))
    }    

    nextPos <- c(newX, newY, newTheta)

    #default to the original Reynolds model
  } 

  return(nextPos)

}


 
# moves each agent in the swarm a fixed distance in a direction based on its theta.
step.swarm <- function(typeSimulation) {

  previousDistTotal <- calculate.group.distance()
  
  for (ind in 1:nIndividuals) {
    # Computes tehe next x,y position for the current individual.

    result <- compute.nextPos(ind, typeSimulation) 
    arena.Data$xPosition[ind] <<- result[1]
    arena.Data$yPosition[ind] <<- result[2]
    arena.Data$theta[ind] <<- result[3]
  }

  nextDistTotal <- calculate.group.distance()

  # Recalculate the sensed denisty value for each agent.
  find.Neighbors()

  # Process density data.
  densityTotal <- 0
  tempDensityArray <- c()

  for(var in 1:nIndividuals) {
    densityTotal <- densityTotal + arena.Data$Density[var] 
    tempDensityArray[var] <- arena.Data$Density[var] 
  }

  meanDensity <- (densityTotal / nIndividuals) 
  sdDensity <- (sd(tempDensityArray)) 
  
  # Assign a density distance to each individual.
  determine.density.distance(meanDensity, sdDensity)

  return(calculate.gsi(previousDistTotal, nextDistTotal))
}


# runs the simulation provided what time of reynolds model you want to run.
run.simulation <- function(typeSim) {
  gsiLog <- c()

  for(run in 1:step.iterations) {
    gsiLog[run] <- step.swarm(typeSim)
  }

  return(gsiLog)
}

totalGsi <- run.simulation("reynoldsAsocial")

plot(totalGsi)

# Display the swarm after running simulation.
arenaSim <- display.swarm()
arenaSim

