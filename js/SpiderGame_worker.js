/**
This is the worker. It is used by a1.html to perform all the CPU-intensive
processing, so the GUI will remain responsive. This worker maintains the state
of the grid, position of the elements on the grid, and performs the computations
that are used to find the path that will be taken by the spider, and carries out the
movement of the spider.

The worker is initialized and given instructions by a1.html.
The worker sends the state information back to a1.html to be drawn on the screen
  so the user can see what the current state is.
**/

//Point class, used to refer to a specific square on the grid
function Point(pos_x,pos_y){
	this.x = pos_x;
	this.y = pos_y;
}
//Node class, used by searches as nodes in a tree.
function Node(parent,point,children,g_score,h_score){
	this.parent = parent;
	this.point = point;
	this.children = children;
	this.g_score = g_score;
	this.h_score = h_score;
	this.f_score = g_score + h_score;
}

//some local variables used by the worker to track it's state.
var parameter = new Object();
var info = new Object();
info.steps = 0;
info.ant = 0;
info.count = 0;
info.ant_win = 0;
var grid_components;
var spider;
var ant;
var steps = new Array();
var x_old=1,y_old=1;
var speed=750;
var move_ant = true;
var out_board = true;
var min_board = 1;
var max_board = 16;
var ant_x_old=5;
var ant_y_old=5;
var is_change_path=false;
var is_null=false;

//initialize the state of the grid.
function first(){
	grid_components = new Array(parameter.grid_size);
	for(var i=0;i<parameter.grid_size;i++){
		grid_components[i] = new Array(parameter.grid_size);
	}
	//initialize square values, set walls
	for(var i=0;i<parameter.grid_size;i++){
		for(var j=0;j<parameter.grid_size;j++){
			if(i == 0 || j == 0 || i == parameter.grid_size-1 || j == parameter.grid_size-1){
				grid_components[i][j] = 3;
			}else{
				grid_components[i][j] = 0;
			}
		}
	}
	//place the spider,  and ant.
	spider = place_spider();
	if (info.count==0 || is_null) 
	   place_food();
	// if we check the change path checkbox  
	else if (info.count!=0 || is_change_path) 
	  nextmove(ant_y_old,ant_x_old);
	refresh();
	
}

//this is the function that is called whenever the worker receives a message.
//based on the content of the message (event.data.do), do the appropriate action.
onmessage = function(event) {
	switch(event.data.do){
		case 'start':
			start_game();
			break;
		case 'stop':
			stop_game();
			break;
		case 'first':
			parameter = event.data.parameter;
			first();
			break;
		case 'set_search':
			parameter.search = event.data.search;
			break;
		case 'change_speed':
			speed = 1100 - event.data.speed;
			break;
		case 'board_disable':
			out_board = event.data.board_disable;
			board()
			break;
		case 'ant_move':
			move_ant = event.data.ant_move;
			break;
		case 'change_path':
			is_change_path = event.data.change_path;
			break;
	}
}

//This function runs repeatedly. Checks if we should move, or search for more steps, and carries out the steps.
function run_game(){
	//stop_game at 100 ant, for statistical purposes:
	if(info.ant >= 100){
		stop();
		return;
	}
	//steps is a list of steps that the spider is to carry out. IF there are no steps left, then run_game a search to find more.
	if(steps.length == 0 ){
		//no steps left, so search for more based on the current search selected.
		switch(parameter.search){
			case 'BFS':
				bfs_findpath();
				break;
			case 'DFS':
				dfs_findpath();
				break;
			case 'A* Heuristic 1':
				a_star_findpath("H1");
				break;
			case 'A* Heuristic 2':
				a_star_findpath("H2");
				break;
			case 'A* (H1+H2)/2':
				a_star_findpath("H1+H2");
				break;
		}
	}
	else{
		//we still have steps left, so move the spider to the next square.
		move(steps.shift());
		// this for change path each step
		if (is_change_path) {
			console.log("active <<<<<<<<<<<<")
			x_old=spider[0].x;
			y_old=spider[0].y;
			ant_x_old=ant.x;
			ant_y_old=ant.y;
			change_path_step();
			steps.length=0;
		}
		
	}
	//send the new state to the browser
	refresh();
	
	
	//wait and then continue with the next move.
	clearTimeout(parameter.runTimeout);
	parameter.runTimeout = setTimeout(run_game, speed);//need to wait a bit, otherwise CPU get overloaded and browser becomes unresponsive.
}

//Breadth First Search
function bfs_findpath(){
	postMessage("running BFS");
	// Creating our Open and Closed Lists
	var open = new Array();
	var close = new Array(parameter.grid_size);
	for(var i=0;i<parameter.grid_size;i++){
		close[i] = new Array(parameter.grid_size);
	}
	//initialize close values to 0
	for(var i=0;i<parameter.grid_size;i++){
		for(var j=0;j<parameter.grid_size;j++){
			close[i][j] = 0;
		}
	}
	// Adding our starting point to Open List
	open.push(new Node(null,spider[0],new Array()));
	// Loop while open contains some data.
	while (open.length != 0) {
		var n = open.shift();
		if(close[n.point.x][n.point.y] == 1)
			continue;
		info.count++;
		// Check if node is ant
		if (grid_components[n.point.x][n.point.y] == 2) {
			//if we have reached ant, climb up the tree until the root to obtain path
			// if two place the same ant and spider
			if (n.parent == null) {
				x_old=n.point.x
				y_old=n.point.y
				info.ant++;
				// ant_x_old=ant.x;
				// ant_y_old=ant.y;
				var message = new Object();
				message.type = 'eaten';
				postMessage(message);
				is_null=true;
				first()
			} else {
				do{
					steps.unshift(n.point);
					if(grid_components[n.point.x][n.point.y] == 0)
						grid_components[n.point.x][n.point.y] = 1;
					n = n.parent;
				}while(n.parent != null)
				is_null=false;
			}
			break;
		}
		
		// Add current node to close
		close[n.point.x][n.point.y] = 1;
		// Add adjacent nodes to open to be processed.
		if (min_board<= n.point.x+1 && n.point.x+1<=max_board 
			&& min_board<= n.point.y-2 && n.point.y-2<=max_board) {
			if(close[n.point.x+1][n.point.y-2] == 0 && (grid_components[n.point.x+1][n.point.y-2] == 0 || grid_components[n.point.x+1][n.point.y-2] == 2 ||grid_components[n.point.x+1][n.point.y-2] == 3))
			n.children.unshift(new Node(n,new Point(n.point.x+1,n.point.y-2),new Array()));
		}
		if (min_board<= n.point.x+2 && n.point.x+2<= max_board
			&& min_board<= n.point.y-1 && n.point.y-1<=max_board) {
			if(close[n.point.x+2][n.point.y-1] == 0 && (grid_components[n.point.x+2][n.point.y-1] == 0 || grid_components[n.point.x+2][n.point.y-1] == 2 ||grid_components[n.point.x+2][n.point.y-1] == 3))
			n.children.unshift(new Node(n,new Point(n.point.x+2,n.point.y-1),new Array()));
		}
		if (min_board<=n.point.x+2 && n.point.x+2<=max_board
			 && min_board<= n.point.y+1 && n.point.y+1<=max_board) {
			if(close[n.point.x+2][n.point.y+1] == 0 && (grid_components[n.point.x+2][n.point.y+1] == 0 || grid_components[n.point.x+2][n.point.y+1] == 2 ||grid_components[n.point.x+2][n.point.y+1] == 3))
			n.children.unshift(new Node(n,new Point(n.point.x+2,n.point.y+1),new Array()));
		}
		if (min_board<=n.point.x+1 && n.point.x+1<=max_board 
			&& min_board<= n.point.y+2 && n.point.y+2<=max_board) {
			if(close[n.point.x+1][n.point.y+2] == 0 && (grid_components[n.point.x+1][n.point.y+2] == 0 || grid_components[n.point.x+1][n.point.y+2] == 2 ||grid_components[n.point.x+1][n.point.y+2] == 3))
			n.children.unshift(new Node(n,new Point(n.point.x+1,n.point.y+2),new Array()));
		}
		if (min_board<=n.point.x-1 && n.point.x-1<=max_board 
			&& min_board<= n.point.y-2 && n.point.y-2<=max_board) {
			if(close[n.point.x-1][n.point.y-2] == 0 && (grid_components[n.point.x-1][n.point.y-2] == 0 || grid_components[n.point.x-1][n.point.y-2] == 2 ||grid_components[n.point.x-1][n.point.y-2] == 3))
			n.children.unshift(new Node(n,new Point(n.point.x-1,n.point.y-2),new Array()));
		}
		if (min_board<=n.point.x-2 && n.point.x-2<=max_board
			 && min_board<= n.point.y-1 && n.point.y-1<=max_board) {
			if(close[n.point.x-2][n.point.y-1] == 0 && (grid_components[n.point.x-2][n.point.y-1] == 0 || grid_components[n.point.x-2][n.point.y-1] == 2 ||grid_components[n.point.x-2][n.point.y-1] == 3))
			n.children.unshift(new Node(n,new Point(n.point.x-2,n.point.y-1),new Array()));
		}
		if (min_board<=n.point.x-2 && n.point.x-2<=max_board 
			&& min_board<= n.point.y+1 && n.point.y+1<=max_board) {
			if(close[n.point.x-2][n.point.y+1] == 0 && (grid_components[n.point.x-2][n.point.y+1] == 0 || grid_components[n.point.x-2][n.point.y+1] == 2 ||grid_components[n.point.x-2][n.point.y+1] == 3))
			n.children.unshift(new Node(n,new Point(n.point.x-2,n.point.y+1),new Array()));
		}
		if (min_board<=n.point.x-1 && n.point.x-1<=max_board 
			&& min_board<= n.point.y+2 && n.point.y+2<=max_board) {
			if(close[n.point.x-1][n.point.y+2] == 0 && (grid_components[n.point.x-1][n.point.y+2] == 0 || grid_components[n.point.x-1][n.point.y+2] == 2 ||grid_components[n.point.x-1][n.point.y+2] == 3))
			n.children.unshift(new Node(n,new Point(n.point.x-1,n.point.y+2),new Array()));
		}
		for(var i=0;i<n.children.length;i++){
			open.push(n.children[i]);
		}
		
	}
}

//Depth First Search
function dfs_findpath(){
	postMessage("running DFS");
	// Creating our Open and Closed Lists
	var open = new Array();
	var close = new Array(parameter.grid_size);
	for(var i=0;i<parameter.grid_size;i++){
		close[i] = new Array(parameter.grid_size);
	}
	//initialize close values to 0
	for(var i=0;i<parameter.grid_size;i++){
		for(var j=0;j<parameter.grid_size;j++){
			close[i][j] = 0;
		}
	}

	// Adding our starting point to Open List
	open.push(new Node(null,spider[0],new Array()));
	// Loop while open contains some data.
	while (open.length != 0) {
		var n = open.shift();
		if(close[n.point.x][n.point.y] == 1)
			continue;
		info.count++;
		// Check if node is ant
		if (grid_components[n.point.x][n.point.y] == 2) {
			// if two place the same ant and spider
			if (n.parent == null) {
				x_old=n.point.x;
				y_old=n.point.y;
				// ant_x_old=ant.x;
				// ant_y_old=ant.y;
				info.ant++;
				var message = new Object();
				message.type = 'eaten';
				postMessage(message);
				is_null=true;
				first();
			} else {
			//if we have reached ant, climb up the tree until the root to obtain path
			do{
				steps.unshift(n.point);
				if(grid_components[n.point.x][n.point.y] == 0)
					grid_components[n.point.x][n.point.y] = 1;
				n = n.parent;

			}while(n.parent != null)
			is_null=false;
		    }
			break;
		}
		// Add current node to close
		close[n.point.x][n.point.y] = 1;
		
		// Add adjacent nodes to open to be processed.

		if (min_board<= n.point.x+1 && n.point.x+1<=max_board 
			&& min_board<= n.point.y-2 && n.point.y-2<=max_board) {
			if(close[n.point.x+1][n.point.y-2] == 0 && (grid_components[n.point.x+1][n.point.y-2] == 0 || grid_components[n.point.x+1][n.point.y-2] == 2 ||grid_components[n.point.x+1][n.point.y-2] == 3))
			n.children.unshift(new Node(n,new Point(n.point.x+1,n.point.y-2),new Array()));
		}
		if (min_board<= n.point.x+2 && n.point.x+2<= max_board
			&& min_board<= n.point.y-1 && n.point.y-1<=max_board) {
			if(close[n.point.x+2][n.point.y-1] == 0 && (grid_components[n.point.x+2][n.point.y-1] == 0 || grid_components[n.point.x+2][n.point.y-1] == 2 ||grid_components[n.point.x+2][n.point.y-1] == 3))
			n.children.unshift(new Node(n,new Point(n.point.x+2,n.point.y-1),new Array()));
		}
		if (min_board<=n.point.x+2 && n.point.x+2<=max_board
			 && min_board<= n.point.y+1 && n.point.y+1<=max_board) {
			if(close[n.point.x+2][n.point.y+1] == 0 && (grid_components[n.point.x+2][n.point.y+1] == 0 || grid_components[n.point.x+2][n.point.y+1] == 2 ||grid_components[n.point.x+2][n.point.y+1] == 3))
			n.children.unshift(new Node(n,new Point(n.point.x+2,n.point.y+1),new Array()));
		}
		if (min_board<=n.point.x+1 && n.point.x+1<=max_board 
			&& min_board<= n.point.y+2 && n.point.y+2<=max_board) {
			if(close[n.point.x+1][n.point.y+2] == 0 && (grid_components[n.point.x+1][n.point.y+2] == 0 || grid_components[n.point.x+1][n.point.y+2] == 2 ||grid_components[n.point.x+1][n.point.y+2] == 3))
			n.children.unshift(new Node(n,new Point(n.point.x+1,n.point.y+2),new Array()));
		}
		if (min_board<=n.point.x-1 && n.point.x-1<=max_board 
			&& min_board<= n.point.y-2 && n.point.y-2<=max_board) {
			if(close[n.point.x-1][n.point.y-2] == 0 && (grid_components[n.point.x-1][n.point.y-2] == 0 || grid_components[n.point.x-1][n.point.y-2] == 2 ||grid_components[n.point.x-1][n.point.y-2] == 3))
			n.children.unshift(new Node(n,new Point(n.point.x-1,n.point.y-2),new Array()));
		}
		if (min_board<=n.point.x-2 && n.point.x-2<=max_board
			 && min_board<= n.point.y-1 && n.point.y-1<=max_board) {
			if(close[n.point.x-2][n.point.y-1] == 0 && (grid_components[n.point.x-2][n.point.y-1] == 0 || grid_components[n.point.x-2][n.point.y-1] == 2 ||grid_components[n.point.x-2][n.point.y-1] == 3))
			n.children.unshift(new Node(n,new Point(n.point.x-2,n.point.y-1),new Array()));
		}
		if (min_board<=n.point.x-2 && n.point.x-2<=max_board 
			&& min_board<= n.point.y+1 && n.point.y+1<=max_board) {
			if(close[n.point.x-2][n.point.y+1] == 0 && (grid_components[n.point.x-2][n.point.y+1] == 0 || grid_components[n.point.x-2][n.point.y+1] == 2 ||grid_components[n.point.x-2][n.point.y+1] == 3))
			n.children.unshift(new Node(n,new Point(n.point.x-2,n.point.y+1),new Array()));
		}
		if (min_board<=n.point.x-1 && n.point.x-1<=max_board 
			&& min_board<= n.point.y+2 && n.point.y+2<=max_board) {
			if(close[n.point.x-1][n.point.y+2] == 0 && (grid_components[n.point.x-1][n.point.y+2] == 0 || grid_components[n.point.x-1][n.point.y+2] == 2 ||grid_components[n.point.x-1][n.point.y+2] == 3))
			n.children.unshift(new Node(n,new Point(n.point.x-1,n.point.y+2),new Array()));
		}
		for(var i=0;i<n.children.length;i++){
			open.unshift(n.children[i]);
		}
	}
}

//A* search, based on selected heuristic
function a_star_findpath(search_type){
	postMessage("running " + search_type);
	// Creating our Open and Closed Lists
	var open = new Array();
	var close = new Array(parameter.grid_size);
	for(var i=0;i<parameter.grid_size;i++){
		close[i] = new Array(parameter.grid_size);
	}
	//initialize close values to 0
	for(var i=0;i<parameter.grid_size;i++){
		for(var j=0;j<parameter.grid_size;j++){
			close[i][j] = 0;
		}
	}
	
	// Adding our starting point to Open List
	open.push(new Node(null,spider[0],new Array(),0,heuristic_estimate(spider[0],ant,search_type)));
	// Loop while open contains some data.
	while (open.length != 0) {
		//pick the node in openset that has the lowest f_score
		open.sort(function(a,b){return a.f_score - b.f_score})
		var n = open.shift();
		
		if(close[n.point.x][n.point.y] == 1)
			continue;
		info.count++;
		// Check if node is ant
		if (grid_components[n.point.x][n.point.y] == 2) {
			//if we have reached ant, climb up the tree until the root to obtain path
			// if two place the same ant and spider
			if (n.parent == null) {
				x_old=n.point.x;
				y_old=n.point.y;
				info.ant++;
				var message = new Object();
				message.type = 'eaten';
				postMessage(message);
				// ant_x_old=ant.x;
				// ant_y_old=ant.y;
				is_null=true;
				first();
			} else {
			do{
				steps.unshift(n.point);
				if(grid_components[n.point.x][n.point.y] == 0)
					grid_components[n.point.x][n.point.y] = 1;
				n = n.parent;
			}while(n.parent != null)
			is_null=false;
		    }
			break;
		}
		// Add current node to close
		close[n.point.x][n.point.y] = 1;

		if (min_board<= n.point.x+1 && n.point.x+1<=max_board 
			&& min_board<= n.point.y-2 && n.point.y-2<=max_board) {
			if(close[n.point.x+1][n.point.y-2] == 0 && (grid_components[n.point.x+1][n.point.y-2] == 0 || grid_components[n.point.x+1][n.point.y-2] == 2 ||grid_components[n.point.x+1][n.point.y-2] == 3))
			n.children.unshift(new Node(n,new Point(n.point.x+1,n.point.y-2),new Array(),n.g_score+1,heuristic_estimate(new Point(n.point.x+1,n.point.y-2),ant,search_type)));
		}
		if (min_board<= n.point.x+2 && n.point.x+2<=max_board 
			&& min_board<= n.point.y-1 && n.point.y-1<=max_board) {
			if(close[n.point.x+2][n.point.y-1] == 0 && (grid_components[n.point.x+2][n.point.y-1] == 0 || grid_components[n.point.x+2][n.point.y-1] == 2 ||grid_components[n.point.x+2][n.point.y-1] == 3))
			n.children.unshift(new Node(n,new Point(n.point.x+2,n.point.y-1),new Array(),n.g_score+1,heuristic_estimate(new Point(n.point.x+2,n.point.y-1),ant,search_type)));
		}
		if (min_board<=n.point.x+2 && n.point.x+2<=max_board
			 && min_board<= n.point.y+1 && n.point.y+1<=max_board) {
			if(close[n.point.x+2][n.point.y+1] == 0 && (grid_components[n.point.x+2][n.point.y+1] == 0 || grid_components[n.point.x+2][n.point.y+1] == 2 ||grid_components[n.point.x+2][n.point.y+1] == 3))
			n.children.unshift(new Node(n,new Point(n.point.x+2,n.point.y+1),new Array(),n.g_score+1,heuristic_estimate(new Point(n.point.x+2,n.point.y+1),ant,search_type)));
		}
		if (min_board<=n.point.x+1 && n.point.x+1<=max_board 
			&& min_board<= n.point.y+2 && n.point.y+2<=max_board) {
			if(close[n.point.x+1][n.point.y+2] == 0 && (grid_components[n.point.x+1][n.point.y+2] == 0 || grid_components[n.point.x+1][n.point.y+2] == 2 ||grid_components[n.point.x+1][n.point.y+2] == 3))
			n.children.unshift(new Node(n,new Point(n.point.x+1,n.point.y+2),new Array(),n.g_score+1,heuristic_estimate(new Point(n.point.x+1,n.point.y+2),ant,search_type)));
		}
		if (min_board<=n.point.x-1 && n.point.x-1<=max_board 
			&& min_board<= n.point.y-2 && n.point.y-2<=max_board) {
			if(close[n.point.x-1][n.point.y-2] == 0 && (grid_components[n.point.x-1][n.point.y-2] == 0 || grid_components[n.point.x-1][n.point.y-2] == 2 ||grid_components[n.point.x-1][n.point.y-2] == 3))
			n.children.unshift(new Node(n,new Point(n.point.x-1,n.point.y-2),new Array(),n.g_score+1,heuristic_estimate(new Point(n.point.x-1,n.point.y-2),ant,search_type)));
		}
		if (min_board<=n.point.x-2 && n.point.x-2<=max_board
			 && min_board<= n.point.y-1 && n.point.y-1<=max_board) {
			if(close[n.point.x-2][n.point.y-1] == 0 && (grid_components[n.point.x-2][n.point.y-1] == 0 || grid_components[n.point.x-2][n.point.y-1] == 2 ||grid_components[n.point.x-2][n.point.y-1] == 3))
			n.children.unshift(new Node(n,new Point(n.point.x-2,n.point.y-1),new Array(),n.g_score+1,heuristic_estimate(new Point(n.point.x-2,n.point.y-1),ant,search_type)));
		}
		if (min_board<=n.point.x-2 && n.point.x-2<=max_board 
			&& min_board<= n.point.y+1 && n.point.y+1<=max_board) {
			if(close[n.point.x-2][n.point.y+1] == 0 && (grid_components[n.point.x-2][n.point.y+1] == 0 || grid_components[n.point.x-2][n.point.y+1] == 2 ||grid_components[n.point.x-2][n.point.y+1] == 3))
			n.children.unshift(new Node(n,new Point(n.point.x-2,n.point.y+1),new Array(),n.g_score+1,heuristic_estimate(new Point(n.point.x-2,n.point.y+1),ant,search_type)));
		}
		if (min_board<=n.point.x-1 && n.point.x-1<=max_board 
			&& min_board<= n.point.y+2 && n.point.y+2<=max_board) {
			if(close[n.point.x-1][n.point.y+2] == 0 && (grid_components[n.point.x-1][n.point.y+2] == 0 || grid_components[n.point.x-1][n.point.y+2] == 2 ||grid_components[n.point.x-1][n.point.y+2] == 3))
			n.children.unshift(new Node(n,new Point(n.point.x-1,n.point.y+2),new Array(),n.g_score+1,heuristic_estimate(new Point(n.point.x-1,n.point.y+2),ant,search_type)));
		}
		for(var i=0;i<n.children.length;i++){
			var index = in_open(open,n.children[i]);
			if(index < 0){
				//node not in open, add it.
				open.push(n.children[i]);
			}else{
				//found a node in open that we already found earlier. Check if this is a better route
				if(n.children[i].f_score < open[index].f_score){
					//better route, use this one instead.
					//set the new parent for all the old child nodes
					for(var j=0;j<open[index].children.length;j++){
						open[index].children[j].parent = n.children[i];
					}
					//give the children to the new parent
					n.children[i].children = open[index].children;
					//remove the old node from open
					open.splice(index,1);
					//add new node to open
					open.push(n.children[i]);
					//Update the scores for all child nodes.
					update_scores(n.children[i]);
				}
			}
		}
	}
}

//updates scores of child nodes
function update_scores(parent){
	for(var i=0;i<parent.children.length;i++){
		parent.children[i].g_score = parent.g_score+1;
		parent.children[i].h_score = heuristic_estimate(parent.children[i].point);
		parent.children[i].f_score = parent.children[i].g_score + parent.children[i].h_score;
		//recursively update any child nodes that this child might have.
		update_scores(parent.children[i]);
	}
}

//check is aNode is in open. If a match is found, return index, -1 if no match
function in_open(open,aNode){
	for(var i=0;i<open.length;i++){
		if(open[i].point.x == aNode.point.x && open[i].point.y == aNode.point.y)
			return i;
	}
	return -1;
}

//heuristic_estimate interface, used to keep the calls in a_star_findpath() simple. Check the search_type,  and call the appropriate helper function.
function heuristic_estimate(point1, point2,search_type){
	switch(search_type){
		case "H1":
			return heuristic_estimate_1(point1,point2);
		case "H2":
			return heuristic_estimate_2(point1,point2);
		case "H1+H2":
			return (heuristic_estimate_1(point1,point2) + heuristic_estimate_2(point1,point2))/2;
	}
}

//First heuristic:Euclidean Distance calculate the direct path to the ant. This will usually be less than actual, because it's a slant distance.
function heuristic_estimate_1(point1,point2){
	return Math.sqrt(Math.pow(point1.x-point2.x,2) + Math.pow(point1.y-point2.y,2));
}
//Second heuristic:Manhattan distances calculate the actual distance that the spider would have to travel to reach the ant.
function heuristic_estimate_2(point1,point2){
	return Math.abs(point1.x-point2.x)+Math.abs(point1.y-point2.y);
}

//start_game the run_game function
function start_game(){
	first();
	parameter.runTimeout = setTimeout(run_game, speed);
	info.steps = 0;
	info.ant = 0;
	info.count = 0;
	info.ant_win = 0;
}

//stop_game the run_game function
function stop_game(){
	clearTimeout(parameter.runTimeout);
}

//send the current state information to the browser to redraw the latest state.
function refresh(){
	var message = new Object();
	message.type = 'move';
	message.grid_components = grid_components;
	message.info = info;
	postMessage(message);
}

//move the spider to the new Point given
function move(new_head){
	//check that this is a legal move. Square must be adjacent and empty (can move to empty, ant or path.
	if((!is_adjacent(new_head,spider[0])) || grid_components[new_head.x][new_head.y] > 3){
		return false;
	}
	//if we are at a ant square, put a new ant on the grid, and keep info.
	if(grid_components[new_head.x][new_head.y] == 2){
		var message = new Object();
		message.type = 'eaten';
		postMessage(message);
		place_food();
		info.ant++
	}
	//clear the brevious place
	grid_components[spider[0].x][spider[0].y] = 0;
	
	//move the spider forward
	spider[0].x = new_head.x;
	spider[0].y = new_head.y;
	
	//update grid_components with new spider information for redrawing
	grid_components[spider[0].x][spider[0].y] = 5;
	//keep info
	info.steps++;
	if (spider[0].x ==0 || spider[0].x == 17 ||spider[0].y ==0 || spider[0].y == 17) {
		x_old=1
		y_old=1
		finished_game()
	}
	// if check the box move for move ant 
	if (move_ant  && is_change_path == false){
	  nextmove(ant.y,ant.x);
	}
	return true;
}

//helper function checks if two points are adjacent. Used to check if steps are legal.
function is_adjacent(point1, point2){
	if( (point1.x-1 == point2.x || point1.x+1 == point2.x)
	 && (point1.y-2 == point2.y || point1.y+2 == point2.y))
		return true;
	if( (point1.y-1 == point2.y || point1.y+1 == point2.y)
	 && (point1.x-2 == point2.x || point1.x+2 == point2.x))
		return true;
	if( point1.x == point2.x && (point1.y-1 == point2.y || point1.y+1 == point2.y))
		return true;
	if( point1.y == point2.y && (point1.x-1 == point2.x || point1.x+1 == point2.x))
		return true;
	return false;
}

//place the spider on the grid. 
function place_spider(){
	if (x_old!=1 || y_old!=1) {
		var spider = new Array(0);
		grid_components[x_old][y_old]=5;
		spider[0]=new Point(x_old,y_old);
	} else {
	var middle_x = 9;
	var middle_y = 9;
	var spider = new Array(0);
	grid_components[middle_x+3][middle_y] = 5;
	spider[0] = new Point(middle_x+3,middle_y);
    }
	return spider;
}


//randomly or old value place a ant pellet on the grid.
function place_food(){
	if (info.count==0) {
		random_x = 5
		random_y = 5
	}
	else {
	do{
		var random_x = Math.floor(Math.random()*(parameter.grid_size-2))+1;
		var random_y = Math.floor(Math.random()*(parameter.grid_size-2))+1;
	}while(grid_components[random_x][random_y] != 0);
    }
	grid_components[random_x][random_y] = 2;
	ant = new Point(random_x,random_y);
}
function nextmove(food_y,food_x) {
	var rand = Math.round(Math.random()*1);
	if (rand == 1) {
		var random_x = food_x +1;
	}
	else{
		var random_x = food_x - 1;
	}
	var random_y = food_y;
     // out side the board
	if ( random_x > parameter.grid_size-2 || random_x < 1) {
		info.ant_win++;
		var message = new Object();
		message.type = 'ant_win';
		postMessage(message);
	    grid_components[food_x][food_y] = 0;
		place_food()
	}
	else if (food_x == random_x && food_y == random_y) {
		console.log("same");
	}
	else{
	grid_components[food_x][food_y] = 0;
	grid_components[random_x][random_y] = 2;
	ant = new Point(random_x,random_y);}
} 
function finished_game() {
	postMessage("The game finished");
	var message = new Object();
	message.type = 'finish';
	postMessage(message);
}
function board() {
	if (out_board == false ){
	  min_board = 1;
	  max_board = parameter.grid_size-2;}
	else{
		min_board = 0;
		max_board = parameter.grid_size-1;
	}
}
function change_path_step() {
	first();
}