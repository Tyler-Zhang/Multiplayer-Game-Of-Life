// Import all required modules
var http 		= require("http");			// Creates the HTTP server 
var express 	= require("express");		// Handles HTTP routing for files
var socket_io	= require("socket.io")		// Websocket Library
var path 		= require("path");			// Joins Directory sections together (So that it can be run on Windowns & Linux)
var game		= require("game");

// Define HTTP routes
var app = express();
var _http = http.Server(app);

app.use(express.static(file(""))); // Specifies the directory to serve files from

app.get("/",function(req, res){
	res.sendFile(File("index.html"));
});

// Turn on Websocket server, log to console when a client connects
var io = socket_io(_http);
var room = new game.room(1);

io.on('connection', function(socket){
	
	console.log("A user has connected " + socket.id);
	room.addUser(socket.id);

	// When the server recieves mouse move events
  	socket.on("m", function(dat){
  		//console.log(socket.id + ": " + dat);
  		socket.broadcast.emit("m", dat);	//broadcasts data to everyone but origin
  	});

  	// When server recieves change state events
  	socket.on("c", function(dat){
  		//room.changeState(socket.id, dat);
  		io.emit("c", dat);
  	});

  	// When server recieves play events
  	socket.on("p", function(dat){
  		if(room.simulation)
  			io.emit("p", true);
  		else
  			io.emit("p", false);
  		
  		room.simulation = !room.simulation;
  	});

});


// Initializes the HTTP server to listen on port 8080
_http.listen(8080, function(){console.log("Listening on port 8080")});


// Uses Path library to join directory for files
function File(name){
	return path.join(__dirname, "public", name);
}
