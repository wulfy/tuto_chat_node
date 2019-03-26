var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

const port = 4000;
const TYPE_MESSAGE = "message";
const TYPE_USER_LIST = "TYPE_USER_LIST";
const TYPE_ERROR = "TYPE_ERROR";
const TYPE_IDENTIFY = "identify";

function getNow() {
	var m = new Date();
	var dateString = m.getUTCFullYear() +"/"+ (m.getUTCMonth()+1) +"/"+ m.getUTCDate() + " " + m.getUTCHours() + ":" + m.getUTCMinutes() + ":" + m.getUTCSeconds();
	return dateString;
}

var userList = [];

io.on('connection', function(socket){
  console.log('a user is connected');
  const message = 'server > hi';
  socket.emit(TYPE_MESSAGE,{message});
  socket.userName = null;

  socket.on(TYPE_IDENTIFY,function(data){
  	console.log('a user is identified : ' + data.userName);
  	socket.userName = data.userName;
  	userList.push(data.userName);
  	io.emit(TYPE_USER_LIST,{userList});
  });

  socket.on(TYPE_MESSAGE, function(data){
  	if(socket.userName === null)
  	{
  		const message = 'You must be identified to send a massage please provide a userName';
  		socket.emit(TYPE_ERROR,{message});
  		return;
  	}

  	const message = socket.userName + ' > ' + data.message;
  	io.emit(TYPE_MESSAGE,{message});

  });

  socket.on('disconnect', function(){

  	var userName = "";
  	if(socket.userName)
  	{
  		userName = socket.userName;
  		userList.splice( userList.indexOf(userName), 1 );
  		io.emit(TYPE_USER_LIST,{userList});
    }
    console.log('user ' +userName+ ' disconnected');
  });

});

http.listen(port, function(){
  console.log('listening on *:'+port);
});