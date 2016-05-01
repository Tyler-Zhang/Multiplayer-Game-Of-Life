/*	Web.js contains all of the javascript code that is used to connect to the server
	By seperating the two files, it makes the code more organized
*/

var socket;					// Socket.io Obj for communicating with server
var cellChangeBuffer = [];	// Cell Buffer that stores cell changes (WIP)

/*	Loads socket.io object from the index to be used
	Also defines the functions to be called when certain events are emmited
	@param {string} IO
*/
function loadIO(IO){
	socket = IO;
	socket.on("m", function(dat){
	TweenMax.set(cursor, {x:dat[0],y:dat[1]});
	});

	socket.on("c", oChangeCell);
	socket.on("p", oPlaySimulation);
	//socket.on("s", oChangeSettings);

	window.setInterval(cSendChangeCell, 1000);
}

/*	This function handles mouse move events
	It only emits events every half second to save bandwidth
*/
function cMouseMove(data){

}
/*	This function handles change cell commands
	It pushes changes to the changecell buffer and sends information every second
	This improves on bandwidth, and more importantly helps smooth out drawing animations
	@param {number} xPos 	- x coordinate of the cell
	@param {number} ypos 	- y coordinate of the cell
	@param {boolean} erase 	- If the user is erasing or not
*/
function cChangeCell(xPos, yPos, erase){
	// Code for the first entry of the buffer
	if(!cellChangeBuffer[0]){
		cellChangeBuffer.push(new Date().getTime());
		cellChangeBuffer.push({x: xPos, y: yPos, erase: erase, time:0});
	}
	cellChangeBuffer.push({x: xPos, y: yPos, erase: erase, time: new Date().getTime() - cellChangeBuffer[0] - cellChangeBuffer[cellChangeBuffer.length -1].time});	// Records delta time
}

/*	This function sends the changeCellBuffer to the server
	There are no parameters as the changeCellBuffer is a global variable
	It also clears the buffer afterwards
*/
function cSendChangeCell(){
	if(!cellChangeBuffer[0])	// If theres no data in the cellChangeBuffer to be handled, this function does not need to be called
		return;

	socket.emit("c", cellChangeBuffer);	// Emits the data to the server
	cellChangeBuffer = [];
}

/*	This function takes the data packet and renders it onto the screen
	@param {Array({x, y, erase, time})} data - Array of data objects that contain cell change information 

*/
var x = [];
function oChangeCell(data){
	setTimeout(function(){
		//console.log(data.length);
		if(data.length <= 1)
			return;

		var dat = data[1]; 

		if(dat.erase)
			ctx.clearRect(dat.x * bd.cellWidth, dat.y * bd.cellHeight, bd.cellWidth,bd.cellHeight);
		else
			ctx.fillRect(dat.x * bd.cellWidth, dat.y * bd.cellHeight, bd.cellWidth,bd.cellHeight);

		state[dat.x][dat.y] = !dat.erase;
		data.splice(1,1);
		TweenMax.set(cursor,{x: dat.x, y: dat.y});
		oChangeCell(data);


	}, 5);

}