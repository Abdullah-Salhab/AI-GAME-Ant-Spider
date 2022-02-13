// 2/5/2021 2:10- 2:30 + 6:40 - 7:20  = 4 hours learn and understand how we make the data struture 
// 3-4/5/2021 8:40am - 11:40 + 6:20-7:15 + 10:10 - at 12:50am Finalllllly it is work - 2:00am all algo is almost finish + 2:50 - 3:58  = 12 hours
// 4/5/2021 1:45 - 2:15 turn off laptop 6:00 - 7:30 + 10:10pm - 12:15 am = 6 hours some coding and some styles
// 5/5/2021 9:25 - 12:30 + 1:45 - 3:00 + 3:40 - 4:30 +11:00 - 11:30 pm = 7 hours styles and colors and imges
// 6/5/2021 10:00 - 12:30  + 2:20 - 3:40 + 10:30 - 2:04 am = 7.30 hours sounds and styles nad buttons
// 7/5/2021 6:05 pm - 7:30 + 10:05 - 12:15 change path each step with checkbox + 12:15 start change names and find new heuristics - 1:50 am = 5 hours 
// 8/5/2021 12:00 - 12:55 + 1:30- 4:25 + 5:35 - 6:30 + 10:40 - start report - 1:45 am + 1:45 - css and html 2:05 am  = 9 hours 
// 9/5/2021 10:00- 12:30 + 4:30 - 7:30 + 10:45 - change the game as executable file .exe and change html content  - 1:30 am = 9:30 hours 
// After A lot of searches and learn new topices and after spend 30 hours in learn python I chose js ,css ,html 
// at 10/5/2021 I work also for 5 hours I finish the game and it takes about 9 days in 65 hours so it is hard game but at the end I learn that I should not give up 
// Made BY THE Programmer Abdullah Salhab 
// and now i have understand the heurstic function 
//the canvas used to draw the state of the game
var context;

//parameter object used to set the parameters of the game. This object is passed to the worker thread to initialize it
var parameter = new Object();
parameter.grid_size = 18;
parameter.square_size = 35;
parameter.search = 'BFS';
parameter.runTimeout = 0;




function first(){
	// we make 2d for create canvas
	var music=document.getElementById("music");
	music.play();
	music.volume = 0.2;
	context = document.getElementById('Game_canvas').getContext("2d");
	//tell the worker to set itself up
	var message = new Object();
	message.do = 'first';
	message.parameter = parameter;
	worker.postMessage(message);
	change_search();
}

//Redraw the screen based on the state of the game, which is passed from the worker
function refresh(data){
	//stop when we reach 100, this is so we have consistent sample sizes
	if(data.info.food >= 100)
		stop();
	//output some info about our performance
	document.getElementById('moves_num').innerHTML = data.info.steps;
	document.getElementById('ant_win').innerHTML = data.info.ant_win;
	document.getElementById('food_val').innerHTML = data.info.ant;
	document.getElementById('avg_moves_num').innerHTML = data.info.steps/(data.info.ant);
	document.getElementById('avg_nodes_val').innerHTML = data.info.count/(data.info.ant);
	//draw the grid_components, color based on what type of square
	for(var i=0;i<parameter.grid_size;i++){
		for(var j=0;j<parameter.grid_size;j++){
			switch(data.grid_components[i][j]){
			case 0:
				//empty
				var img3 = document.getElementById("image3");
				var img4 = document.getElementById("image4");
				var pat3 = context.createPattern(img3, "repeat");
				var pat4 = context.createPattern(img4, "repeat");
				context.fillRect(i*parameter.square_size, j*parameter.square_size,  parameter.square_size,  parameter.square_size);
				
				
				if ((i%2!=0 && j%2!=0 )|| (i%2==0 && j%2==0 )) {
					context.fillStyle = "#003baa";
					context.fillStyle = pat3;
				}
				else if(i%2==0 && j%2!=0){
					context.fillStyle = "#0f8500";
					context.fillStyle = pat4;
				}
				else{
				     context.fillStyle = "#0f8500";
					 context.fillStyle = pat4;}
				
				context.beginPath();
				context.rect(i*parameter.square_size, j*parameter.square_size, parameter.square_size-1, parameter.square_size-1);
				context.closePath();
				context.fill();
				context.beginPath();
				context.rect(i*parameter.square_size, j*parameter.square_size, parameter.square_size, parameter.square_size);
				context.closePath();
				context.fillStyle = "#000";
				context.stroke();
				break;
			case 1:
				//path
				context.fillStyle = "#C3D9FF";
				var img6 = document.getElementById("image6");
				var pat6 = context.createPattern(img6, "repeat");
				context.beginPath();
				context.rect(i*parameter.square_size,j*parameter.square_size, parameter.square_size, parameter.square_size);
				context.fillRect(i*parameter.square_size, j*parameter.square_size,  parameter.square_size,  parameter.square_size);
				context.fillStyle = pat6;
				context.closePath();
				context.fill();
				context.beginPath();
				context.rect(i*parameter.square_size, j*parameter.square_size, parameter.square_size, parameter.square_size);
				context.closePath();
				context.fillStyle = "#000";
				context.stroke();
				break;
			case 3:
				//wall
				context.fillStyle = "#401c00";
				var img5 = document.getElementById("image5");
				var pat5 = context.createPattern(img5, "repeat");
				context.beginPath();
				context.rect(i*parameter.square_size,j*parameter.square_size, parameter.square_size, parameter.square_size);
				context.fillRect(i*parameter.square_size, j*parameter.square_size,  parameter.square_size,  parameter.square_size);
				context.fillStyle = pat5;
				context.closePath();
				context.fill();
				break;
			case 2:
				//food
				context.fillStyle = "#c33";
				context.beginPath();
				var img = document.getElementById("image");
				var pat = context.createPattern(img, "repeat");
				context.rect(i*parameter.square_size,j*parameter.square_size, parameter.square_size, parameter.square_size);
				context.fillRect(i*parameter.square_size, j*parameter.square_size,  parameter.square_size,  parameter.square_size);
				context.closePath();
				context.fillStyle = pat;
				context.fill();
				context.beginPath();
				context.rect(i*parameter.square_size, j*parameter.square_size, parameter.square_size, parameter.square_size);
				context.closePath();
				context.fillStyle = "#000";
				context.stroke();
				break;
			case 4:
				//obstacle
				context.fillStyle = "#804000";
				context.beginPath();
				context.rect(i*parameter.square_size,j*parameter.square_size, parameter.square_size, parameter.square_size);
				context.closePath();
				context.fill();
				break;
			default:
				if(data.grid_components[i][j] == 5){
					//head
					context.fillStyle = "#00FF00";
					context.beginPath();
					var img2 = document.getElementById("image2");
					var pat2 = context.createPattern(img2, "repeat");
					context.rect(i*parameter.square_size,j*parameter.square_size, parameter.square_size, parameter.square_size);
					context.fillRect(i*parameter.square_size, j*parameter.square_size,  parameter.square_size,  parameter.square_size);
					context.closePath();
					context.fillStyle = pat2;
					context.fill();
					context.beginPath();
					context.rect(i*parameter.square_size, j*parameter.square_size, parameter.square_size, parameter.square_size);
					context.closePath();
					context.fillStyle = "#000";
					context.stroke();
					break;
				}				
			}
		}
	}
}

//create a web worker that will do the processing
var worker = new Worker("js/SpiderGame_worker.js");
//when the worker sends a message, act on it.
worker.onmessage = function(event) {
	//if it's a move, then redraw the screen based on the state passed
	if (event.data.type == 'finish')
	    finish_game()  	
	if(event.data.type == 'move')
		refresh(event.data);
	if(event.data.type == 'eaten')
	    document.getElementById("eat_sound").play();
	if(event.data.type == 'ant_win')
	    document.getElementById("ant_out").play();
	else{
		// console.log(event.data);
        }
	//otherwise, it's an error, send it to the console so we can see it in firebug
};

//if the worker reports an error, log it in firebug
worker.onerror = function(error) {  
	console.log(error.message);
};  

//sends a start message to the worker. The worker will begin processing until it's told to stop.
function start(){
	document.getElementById("music").play();
	document.getElementById("start").style.opacity="0";
	document.getElementById("start").style.visibility="hidden";
	document.getElementById("stop").style.opacity="1";
	document.getElementById("stop").style.visibility="visible";
	reset_place();
	outside_bord();
	var message = new Object();
	message.do = 'start';
	worker.postMessage(message);
}

//stop the worker. It will be 'paused' and wait until it's told to start again. State will be maintained
function stop(){
	document.getElementById("restart2").style.opacity="1";
	document.getElementById("restart2").style.visibility="visible";
	document.getElementById("stop").style.opacity="0";
	document.getElementById("stop").style.visibility="hidden";
	var message = new Object();
	message.do = 'stop';
	worker.postMessage(message);
}

//update the type of search we want the worker to use.
function change_search(){
	var message = new Object();
	message.do = 'set_search';
	message.search = document.getElementById('algo').value;
	worker.postMessage(message);
}
function finish_game() {
	stop()
	document.getElementById("music").pause();
	document.getElementById("game_over").play();
	document.getElementById("all").style.opacity="0.3";
	document.getElementById("finish_statment").style.opacity="1";
	document.getElementById("blur").style.display="block";
	document.getElementById("finish_statment").style.top= "250px";
	document.getElementById("finish_statment").style.left= "400px";
}
function reset_place() {
	document.getElementById("all").style.opacity="1";
	document.getElementById("finish_statment").style.opacity="0";
	document.getElementById("blur").style.display="none";
	document.getElementById("finish_statment").style.top= "-100px";
	document.getElementById("finish_statment").style.left= "-100px";
}
function restart() {
	location.reload()
}
function change_speed() {
	var speed=document.getElementById("speed").value;
    document.getElementById("result_speed").innerHTML=parseInt(speed/100);
	var message = new Object();
	message.do = 'change_speed';
	message.speed = speed;
	worker.postMessage(message);
}
function ant_move() {
	var check=document.getElementById("ant_move").checked;
	if (check) {
		var message = new Object();
		message.do = 'ant_move';
		message.ant_move = true;
		worker.postMessage(message);
	}
	else{
		var message = new Object();
		message.do = 'ant_move';
		message.ant_move = false;
		worker.postMessage(message);
	}
}
function outside_bord() {
	var check=document.getElementById("board_disable").checked;
	if (check) {
		var message = new Object();
		message.do = 'board_disable';
		message.board_disable = true;
		worker.postMessage(message);
	}
	else{
		var message = new Object();
		message.do = 'board_disable';
		message.board_disable = false;
		worker.postMessage(message);
	}
}
function stop_music() {
	var check=document.getElementById("stop_sound").checked;
	if (check) {
		document.getElementById("music").pause();
	}
	else{
		document.getElementById("music").play();
	}
	
}
function change_path() {
	var check=document.getElementById("change_path").checked;
	if (check) {
		document.getElementById("ant_move").checked=true;
		ant_move();
		var message = new Object();
		message.do = 'change_path';
		message.change_path = true;
		worker.postMessage(message);
	}
	else{
		document.getElementById("ant_move").checked=false;
		ant_move();
		var message = new Object();
		message.do = 'change_path';
		message.change_path = false;
		worker.postMessage(message);
	}
}
