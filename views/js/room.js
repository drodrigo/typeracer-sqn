var socket, roomname, ioRoom;
var socket = io.connect('http://localhost:3000');
var users = [];

socket.on('enterRoom', function(roomname){
    console.log("ENTERED ROOM: " + roomname);
});

socket.on('refreshCurrentUsers', function(users){
    clearNewUsers();
    refreshCurrentUsers(users);
});

socket.on('userJoined', function(username){
    clearJoinedUsers();
    pushUsersNotification(username, ' has joined the room <br/>');
});

socket.on('userLeft', function(username, users){
    clearJoinedUsers();
    pushUsersNotification(username, ' has left the room <br/>');
});


function refreshCurrentUsers(users){
    for(var properties in users){
        for(var property in users[properties]){
            if(property === 'name'){
                var el = document.getElementById("username");
                el.innerHTML += users[properties][property] + '<br/>';
            }
        }
    }
}

function pushUsersNotification(username, message){
    var el = document.getElementById("joined");
    el.innerHTML += username + message;
}

function clearNewUsers(){
    var el = document.getElementById("username");
    el.innerHTML = "";
}

function clearJoinedUsers(){
    var el = document.getElementById("joined");
    el.innerHTML = '';
}
