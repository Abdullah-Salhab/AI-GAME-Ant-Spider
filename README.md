# The Spider Game

## Introduction
In this project you will be implementing a game that simulates a spider hunting for food. This game is inspired by many earlier games, such as the snake game available for mobile hones and many other platforms (video available at http://www.youtube.com/watch?v=z_Ct-lKwSgo).
The game is played on a varying size grid board. The player controls a spider. The spider,
being a fast creature, moves in the pattern that emulates a knight from the game of chess. There is also an ant that slowly moves across the board, taking steps of one square in one of the eight directions. The spider's goal is to eat the ant by entering the square it currently occupies, at which point another ant begins moving across the board from a random starting location.

## Game Definition
The above Figure illustrates the game. The yellow box shows the location of the spider. The green box is the current location of the ant. The blue boxes are the possible moves the spider could make. The red arrow shows the direction that the ant is moving - which, in this case, is the horizontal X-direction. When the ant is eaten, a new ant is randomly placed on one of the borders of the board and assigned a random direction to move across the screen, depending on where it starts.
To simplify the game, assume that the ant only takes a single step forward each time the spider moves. All your search algorithms should predict the motion of the ant along with the spider, because the position to which it will move next is deterministic. If the ant makes a move that would take it off the board, the spider has failed to catch it, and a new ant is spawned as if it had been caught.
Similar to the snake game, the game only ends if the spider makes a move that causes it to step off the board.
Configuration Playing Board ( Size i.e.,16 X 16)
The Spider location (12,9) and the Ant location (5,5).

![Screenshot 2022-02-13 100745](https://user-images.githubusercontent.com/99129061/153744631-5730ab19-8a0c-41a7-b8ad-e83274597f8b.png)

## Assignment Objectives
1. Implement the Spider game.
1. Implement a Breadth_First Search for the spider to play the game.
1. Implement Depth_First Search for the spider to play the game.
1. Implement A* search.
1. Implement two (2) different heuristics for the spider to play the game.
1. Implement a third heuristic which takes the average of the first two heuristics.
1. Write a short report (no more than two (2) pages) about the state space of the game, and about the choice of your heuristics.
