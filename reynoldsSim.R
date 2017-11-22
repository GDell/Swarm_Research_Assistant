# Author: Gabriel Dell'Accio
# The following is a 2D variant of the Reynolds Boid model.
# LIBRARIES:
library(ggplot2)

# ARENA PARAMETERS:
# Set if equal height and width
size <- 1000.0

centerCor <- rep(size/2,2)

xVal <- size
yVal <- size

nIndividuals <- 100 
swarmCohesion <- 0.5
swarmAvoidance <- 0.5
baseMovementRate <- 4
densitySensitivity <- 75
spatialDistribution <- 150
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


# Function to determine an individual's sensed density value.
determine.density <- function(senseHeight, senseWidth, locationX, locationY) {

  nTotalPositions <- ((senseHeight * senseWidth) * 4)

  startX <- locationX - senseWidth
  # print(paste("Start x: ", startX))

  endX <- locationX + senseWidth
  # print(paste("End x: ", endX))

  startY <- locationY - senseHeight
  endY <- locationY + senseHeight

  numberOfIndividualsPresent <- 0


  count <- 1
  for(indOne in 1:nIndividuals) {

    if((arena.Data$xPosition[count] <= endX) && (arena.Data$xPosition[count] >= startX)) {

      # print(paste("xposition: ", arena.Data$xPosition[count]))

      if((arena.Data$yPosition[count] <= endY) && (arena.Data$yPosition[count] >= startY)) {
        numberOfIndividualsPresent <- numberOfIndividualsPresent + 1
      }
    }

    count <- count + 1
  }

  # print(paste("Number of indviduals in space: ", numberOfIndividualsPresent))
  # print(paste("total positions: ", nTotalPositions))
  finalDensity <- ((numberOfIndividualsPresent / nTotalPositions)  + (numberOfIndividualsPresent/nIndividuals))
  return(finalDensity)

}

# Determines the density value for each agent in the swarm.
find.Neighbors <- function() {
  count <- 1
  for (var in 1:nIndividuals) {
    result <- determine.density(densitySensitivity,densitySensitivity,arena.Data$xPosition[count], arena.Data$yPosition[count])
    # print(result)
    arena.Data$Density[count] <<- result 
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

# Computes the next x,y coor for x individual in the swarm based on its density reading.
compute.nextPos <- function(var) {

    if ((arena.Data$DensityDistance[var]) == 0) {
        movementRate <- baseMovementRate/3
    } else if (arena.Data$DensityDistance[var] == 1) {
        movementRate <- baseMovementRate
    } else if (arena.Data$DensityDistance[var] == 2) {
        movementRate <- baseMovementRate + 2
    } else { 
        movementRate <- baseMovementRate + 4
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
  
    if((newY >= size) || (newY <= 0)) {
      arena.Data$theta[var] <<- abs(180 - arena.Data$theta[var]) 
      newY = arena.Data$yPosition[var] + (movementRate * sin(degreeToRadians(arena.Data$theta[var])))
    } else {
      newY = arena.Data$yPosition[var] + (movementRate * sin(degreeToRadians(arena.Data$theta[var])))
    }    

  nextPos <- c(newX, newY)

}
 
# moves each agent in the swarm a fixed distance in a direction based on its theta.
step.swarm <- function() {
  
  for (ind in 1:nIndividuals) {
    # Computes tehe next x,y position for the current individual.
    result <- compute.nextPos(ind) 
    arena.Data$xPosition[ind] <<- result[1]
    arena.Data$yPosition[ind] <<- result[2]
  }

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
}


# Applys the step function n step.iterations.
run.simulation <- function() {
  for(run in 1:step.iterations) {
    step.swarm()
  }
}
# run.simulation()

# Display the swarm after running simulation.
arenaSim <- display.swarm()
arenaSim

# BEHAVIOR PRIMITIVES:

# HEATMAP GENERATION
# Assign a value to a location given how far away it is from the center. The farther the smaller the value.
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
heat.map <- create.heatmap(xVal,yVal)

# Visualize the heat map
image(heat.map)

