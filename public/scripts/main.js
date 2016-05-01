/*	
	This javascript file has been modified to support multiplayer
	Each user action uses a function that starts with c which stands for Command
	Server actions telling the client what to do starts with o which stands for Order
	Some dead reckoning techniques are used
*/

"use strict"
var bd = {};				// Obj that stores board settings
var state;					// The state array that stores cell states
var neighbor;				// Array that stores how many alive neighbors each cell has
var ctx;					// Canvas Context
var canvas;					// Canvas object
var liveCondition = [2,3]	// How many neighbors for a cell to stay alive
var reproCondition =[3];	// How many neighbors for a cell to become alive
var simulation = false;		// If the game is currently simulating
var random = false;			// When start is pressed, let random cells become alive
var brush = [];				// Array that stores brush


// Defines the canvas and get it's dimensions
window.onload = function(){
	//Get the canvas
	canvas = document.getElementById("canvas");
	canvas.onmousemove = mouseInput;
	canvas.onmousedown = mouseInput;
	ctx = canvas.getContext("2d");
	bd = {
		width : canvas.width,
		height: canvas.height, 
	}
	//Set Default grid size
	setGrid(400,400);
}
// Mouse move event when the mouse is on the canvas
function mouseInput(mD){
		var x = Math.floor(mD.offsetX/bd.cellWidth);
		var y = Math.floor(mD.offsetY/bd.cellHeight);
		var erase = false;

		if(mD.altKey){
			erase = true;
		}
		var packet = {
			x:x,
			y:y,
			erase:erase
		}

		if(mD.buttons !=1){
			cMouseMove(mD.offsetX, mD.offsetY);
			return;
		}

		if(mD.ctrlKey){
			changeCell(brush,x,y,erase);
		} else {
			changeCell([[true]],x,y,erase);
		} 
}
/*	Code to changecell value, it is more complex because it can be used with the brush array
	@param {Array} pattern	- defines the pattern which should be changed on the state
	@param {number} xMouse	- x position of the mouse
	@param {number} yMouse	- y position of the mouse
	@param {boolean} erase	- if the cell states should be killed instead of birthed
*/
function changeCell(pattern, xMouse, yMouse, erase){
	var mX = Math.floor(pattern.length/2);
	var mY = Math.floor(pattern[0].length/2);
	for(var x = 0; x < pattern.length; x ++){
		for(var y = 0; y < pattern[x].length;y ++){
			var xPos = xMouse + x - mX;
			var yPos = yMouse + y - mY;
			if(pattern[x][y] && xPos >= 0 && yPos >= 0 && xPos < bd.x && yPos < bd.y){
					cChangeCell(xPos, yPos, erase);	// Push to mouse move buffer
			}
		}
	}
}

// Sets grid, with the amount of columns and rows
// Also intiates the state and neighbor arrays which are used to store information whilst simulating the game
function setGrid(width,height){
	bd.cellWidth = bd.width/width;
	bd.cellHeight = bd.height/height;
	bd.x = width;
	bd.y = height;

	ctx.clearRect(0,0,bd.width,bd.height);
	//Initalizes the state array and the neighbor array
	state	 = new Array(width);
	neighbor = new Array(width);
	for(var x = 0; x < width; x ++){

		state[x] 	= new Array(height);
		neighbor[x] = new Array(height);

		for(var y  = 0; y < height; y ++){
			if(random && Math.random()>0.5)
				state[x][y] = true;
			else state[x][y] = false;
				neighbor[x][y] = 0;
		}
	}
}
/*	Updates the view
	Recalculates counts how many neighbors each cell has
	Uses die/ reproduce/ live conditions to decide the final state for each cell
	Calls RequestAnimationFrame at the end which calls the function, causing smooth animation
*/
function update(){
	//	Counts the amount of alive neighbors for each cell		
	for(var x = 0; x < bd.x; x++){
		for(var y  = 0; y< bd.y; y++){
			if(state[x][y]){
				for(var xN = -1; xN<=1; xN++){
					for(var yN = -1; yN<=1;yN++){
						if((xN == 0 && yN == 0))
							continue;
						if(xN+x<0 ||xN+x>=bd.x)
							continue;
						if(yN+y<0 ||yN+y>=bd.y)
							continue;
					
							neighbor[x+xN][y+yN]++;
					}
				}
			}
		}
	}
	ctx.clearRect(0,0,bd.width,bd.height);

	// Using the amount of neighbors, each cell's new state is decided
	for(var x = 0; x < bd.x; x++){
		for(var y  = 0; y< bd.y; y++){
			if(state[x][y]){
				if(liveCondition.indexOf(neighbor[x][y])>=0){
					ctx.fillRect(x*bd.cellWidth,y*bd.cellHeight,bd.cellWidth,bd.cellHeight);
					state[x][y] = true;
				} else {
					state[x][y] = false;
				}
			} else if(reproCondition.indexOf(neighbor[x][y])>=0){
				ctx.fillRect(x*bd.cellWidth,y*bd.cellHeight,bd.cellWidth,bd.cellHeight);
				state[x][y] = true;
			}
			neighbor[x][y] = 0;
		}
	}
	if(simulation){
		requestAnimationFrame(update)
	}
}
// When the user hits a play button
function playButton(){

	socket.emit("p");
}

/*	Play order from server
	@param {boolean} simulate - if true, simulation begins
*/
function oPlaySimulation(simulate){
	console.log("play order");
	if(simulate){
		simulation = true;
		update();
		document.getElementById("play").value = "Stop";
	}
	else {
		simulation = false;
		document.getElementById("play").value = "Start";

	}

}
function changeSettings(){
	var gridField = document.getElementById("gridSize");
	var dim = parse(gridField.value,",",true);
	setGrid(dim[0],dim[1]);

	var rules = parse(document.getElementById("rules").value,"/",false);
	liveCondition = parse(rules[0],",",true);
	reproCondition = parse(rules[1],",",true);
}

/*	Parses string of text into sections seperated by key
	@param {String}	text 	- String to be parsed
	@param {String} key  	- What the different data pieces are seperated by
	@param {boolean} number - If the pieces of data are intended to be data or not
*/
function parse(text, key , number){
	var returnArray = [];

	while(true){
		var pos = text.indexOf(key);
		if(pos < 0){
			if(number)
			returnArray.push(Number(text));
		else returnArray.push(text);
			break;
		} else {
			if(number)
				returnArray.push(Number(text.substring(0,pos)));
			else returnArray.push(text.substring(0,pos));
			text = text.substring(pos+1,text.length);
		}
	}
	return returnArray;
}
// clones brush array as state
function setBrush(){
	brush = new Array(state.length);
	
	for(var x = 0; x < brush.length; x++){
		brush[x] = state[x].slice();
	}
}