/*	module.exports contains all of the functions that are to be exported
	This file is to store game states, game functions eg.
	This keeps the networking (socket) stuff and the game logic seperate
*/

module.exports.room = room;

function room(id){
	console.log("Creating new room, id = " + id);
	// These values are all default values, they can be changed by the client

	this.id = id;
	this.bd 				= {x:300, y:300};	// Different from Client's bd, this only includes cell dimensions
	this.liveCondition 		= [2,3]
	this.reproCondition 	= [3];
	this.userList			= [];
	this.random 			= false;
	this.state 				= createState(this.bd.x, this.bd.y);
}

// This will initiate a new user with state and id
room.prototype.addUser = function(id){
	this.userList.push(id);
}

// This will remove a user's id and state from the array and send state back to index.js
room.prototype.removeUser = function(id){
	delete this.userStates[id];
}

//Changes the state of the cell
function changeState(id, coord, state){
	if(state = false){
		this.state[coord.x][coord.y] = -1;
	}	
	else
		this.state[coord.x][coord.y] = this.userList.indexOf(id);
}

// This function creates a 2D array with dimensions width x height
function createState(width, height){
	state = new Array(width);
	for(var x = 0; x < width; x ++){
		state[x] = new Array(height);
		for(var y  = 0; y < height; y ++){
			
			/* ##Not implementing random yet##
				if(random && Math.random()>0.5)
				state[x][y] = true;
				else state[x][y] = false;
			*/
			state[x][y] = -1;
		}
	}
	return state;
}