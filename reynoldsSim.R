# Author: Gabriel Dell'Accio
# The following is a 2D variant of the Reynolds Boid model.

# LIBRARIES:
library(ggplot2)

# ARENA PARAMETERS:
xVal <- 1000.0
yVal <- 1000.0
nIndividuals <- 100 
swarmCohesion <- 0.5
swarmAvoidance <- 0.5

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
arenaSim

# INITIALIZE THE SWARM POPULATION
initialize.swarm <- function(cohesion, avoidance, spatial.distribution.factor, theta.distribution.factor ,coordinateLocation) {

    arena.Data$index <<- c(1:nIndividuals)
    arena.Data$swarm.cohesion <<- rep(swarmCohesion,nIndividuals)
    arena.Data$swarm.avoidance <<- rep(swarmAvoidance,nIndividuals)
    arena.Data$xPosition <<- rep(NA, xVal)
    arena.Data$yPosition <<- rep(NA, yVal)
    arena.Data$theta <<- rep(NA, xVal)
  
  for(var in 1:xVal) {
    arena.Data$xPosition[var] <<- rnorm(1, mean = coordinateLocation[1], sd= spatial.distribution.factor + 50)
    arena.Data$yPosition[var] <<- rnorm(1, mean = coordinateLocation[2], sd= spatial.distribution.factor + 50)
    arena.Data$theta[var] <<- rnorm(1, mean = 180, sd= theta.distribution.factor + 5)
  }
}

# Display the swarm in the 2D arena.
initialize.swarm(swarmCohesion, swarmAvoidance, 50, 5, c(500,500))
arenaSim <- arenaSim + geom_point(aes(arena.Data$xPosition, arena.Data$yPosition))
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



