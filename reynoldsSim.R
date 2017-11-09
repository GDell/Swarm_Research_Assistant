# Author: Gabriel Dell'Accio
# The following is a 2D variant of the Reynolds Boid model.

# LIBRARIES:
library(ggplot2)

# ARENA PARAMETERS:
# Set if equal height and width
size <- 1000.0

centerCor <- rep(size/2, 2)

xVal <- size
yVal <- size

nIndividuals <- 200 
swarmCohesion <- 0.5
swarmAvoidance <- 0.5
baseMovementRate <- 4
densitySensitivity <- 10
spatialDistribution <- 10
thetaDistribution <- 5

# GENERATING AN ARENA
create.arena <- function(xLength, yLength) {
  xLimit <- xLength 
  yLimit <- yLength
  
  arena.Data <<- data.frame(
    yWall = rep(1,yLimit),
    xWall = c(1:xLimit),
    xNorthWall = c(1:xLimit),
    yNorthWall = rep(yLimit,yLimit)
  )

  arena <- ggplot(data = arena.Data, aes(x=xWall,y=yWall))
  # Arena Borders
  arena <- arena + geom_point() +  ylim(1,yLimit) + xlim(1,xLimit) + geom_point(aes(xNorthWall,yNorthWall)) + geom_point(aes(rep(1,xLimit),c(1:yLimit))) + geom_point(aes(rep(xLimit,xLimit),c(1:yLimit)))

  return(arena)
}
arenaSim <- create.arena(xVal, yVal)

# INITIALIZE THE SWARM POPULATION
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

display.swarm <- function() {
  return(arenaSim + geom_point(aes(arena.Data$xPosition, arena.Data$yPosition)))
}

arenaSim <- display.swarm()
arenaSim


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
  finalDensity <- (numberOfIndividualsPresent / nTotalPositions)

  return(finalDensity)

}


find.Neighbors <- function() {
  count <- 1
  for (var in 1:nIndividuals) {
    result <- determine.density(densitySensitivity,densitySensitivity,arena.Data$xPosition[count], arena.Data$yPosition[count])
    print(result)
    arena.Data$Density[count] <<- result 
    count <- count + 1
  }
}

find.Neighbors()



# This function will search a box of x height and width and return the direction of
# the closest neighbor
# senseNeighbor <- function(senseHeight, senseWidth, locationX, locationY) {

#   regionOne <- c()
#   # REGION 1
#   for(k in 1:senseHeight) {
#     for(j in 1:senseWidth) {

#       returnX <- locationX + J
#       returnY <- locationY - k

#       regionOne <- c(regionOne, c(returnX,returnY))


#       returnTwoX <- location

#     }
#   }
# }

# determineThetaDirection <- function(currentTheta) {

#   if ((currentTheta > 0) && (currentTheta < 90)) {

#     # REGION 1
#     # Down to the right, so y is decreasing, x is increasing.

#   } else if((currentTheta > 89) && (currentTheta < 91)) {

#     # DOWN
#     # Downwards, so y is decreasing, x stays the same.

#   } else if((currentTheta > 91)  && (currentTheta < 179)) {

#     # REGION 2
#     # Down to the left, so y is decreasing, x is decreasing.

#   } else if((currentTheta > 179.0) && (currentTheta < 181.00)) {

#     # LEFT
#     # To the left, so y is staying the same, x is decreasing.

#   } else if((currentTheta > 181.0) && (currentTheta < 269.0)) {

#     # REGION 3
#     # Upwards to the left, so Y is increasing, x is decreasing

#   } else if((currentTheta > 269.0) && (currentTheta < 271.0)) {

#     # UP
#     # Upwards, so x is staying the same, y is increasing

#   } else if(currentTheta > 271) {

#     # REGION 4
#     # Upwards to the right, so x is increaing, y is increasing
#   }


#   #return(categorizedTheta)
# }

# This function runs a step of the simulation in which:
  # - Each agent asses how close it is to other agents 
  # - Each agent determines where it will move next
# step.swarm <- function() {

#   # temp.Data <- data.frame(
#   #   index <- c(1:nIndividuals),
#   #   nextX <- rep(0,nIndividuals),
#   #   nextY <- rep(0,nIndividuals),
#   #   nextTheta <- rep(0, nIndividuals)
#   # )


# }

# BEHAVIOR PRIMITIVES:



# # HEATMAP GENERATION
# # Assign a value to a location given how far away it is from the center. The farther the smaller the value.
# assign.location.value <- function(center, currentLocation, distribution.type) {
#   rowDiff <- abs(center[1] - currentLocation[1])
#   columnDiff <- abs(center[2] - currentLocation[2])
#   totalDifference <- rowDiff + columnDiff
#   scaledDifference <- 1 - (distribution.type(totalDifference)/distribution.type(center[1] * 2))
#   return(scaledDifference)
# }
# # Distribution of values around the center of the arena.
# value.distribution <- function(x) {
#   return(x^2)
# }
# # Generate heat map 
# create.heatmap <- function(arena.length, arena.width) {
#   centerArena <- c(arena.length/2, arena.width/2)
#   arena.heat.map <- matrix(nrow = arena.length, ncol = arena.width)
#   for(i in 1:arena.length) {
#     for(j in 1:arena.width) {
#       currentIndex <- c(i,j)
#       arena.heat.map[i,j] <- assign.location.value(centerArena, currentIndex, value.distribution)
#     }
#   }
#   return(arena.heat.map)
# }
# heat.map <- create.heatmap(xVal,yVal)



