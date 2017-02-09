"use strict"
var socket = require('socket.io')
var currentRoom

module.exports = {
  startGame: function(server, roomModel, gameModel, sentences){
    var sentences = sentences.getEnglishSentences()
    var io = socket(server)
    io.sockets.on('connection', function (socket) {
      socket.on('message', function(roomData){
        gameModel.setConnectionProperties(socket, currentRoom, roomData)
        socket.join(socket.room)
        currentRoom = io.sockets.adapter.rooms[roomData.roomname]
        gameModel.setCurrentRoomProperties(currentRoom, socket)
        io.sockets.in(socket.room).emit('refreshCurrentUsers', currentRoom.users)
        socket.broadcast.to(socket.room).emit('userJoined', {
          username: socket.username,
          roomname: socket.room
        })

      })

      socket.on('userReady', function(roomData){
        roomModel.increaseUsersReadyCounter(currentRoom)
        if(currentRoom.usersReady == currentRoom.length){
          io.sockets.in(socket.room).emit('startGame')
          io.sockets.in(socket.room).emit('newSentence', sentences[socket.sentenceCounter])

          io.sockets.in(socket.room).emit('timeRemaining', currentRoom.gameDuration)
          var intervalId = setInterval(function(){
            roomModel.increaseRoundTimeCounter(currentRoom)
            roomModel.decreaseGameDuration(currentRoom)
            if(currentRoom.roundTime == currentRoom.roundTimeCounter){
              roomModel.resetRoomCounters(currentRoom)

              roomModel.setTotalKeystrokes(currentRoom)
              gameModel.setFinalWinner(currentRoom)
              io.sockets.in(socket.room).emit('roundFinished')

            }
            if(currentRoom.gameDuration <= 0){
              clearInterval(intervalId)
              socket.emit('gameFinished', currentRoom.finalWinner)
            }
            else{
              io.sockets.in(socket.room).emit('timeRemaining', currentRoom.gameDuration)
            }

          }, 1000)
        }
      })

      socket.on('resetScore', function(username){
        gameModel.resetScore(socket)
      })

      socket.on('sendPlayerScore', function(username){
        gameModel.increasePlayerScore(socket)
        gameModel.updatePlayerScore(socket, currentRoom)
        gameModel.setCurrentWinner(currentRoom, socket)
        gameModel.updateScore(io, socket)
      })

      socket.on('sentenceFinished', function(){
        gameModel.increaseSentenceCounter(socket)
        if(socket.sentenceCounter == sentences.length){
          gameModel.resetSentenceCounter(socket)
        }
        socket.emit('newSentence', sentences[socket.sentenceCounter])
      })

      socket.on('disconnect', function(){
        if(socket.id && currentRoom){
          roomModel.decreaseUsersReadyCounter(socket)
          socket.leave(socket.room)
          roomModel.deletePlayerFromRoom(socket, currentRoom)
          io.sockets.in(socket.room).emit('userLeft', socket.username, currentRoom.users)
          io.sockets.in(socket.room).emit('refreshCurrentUsers', currentRoom.users)

        }
      })

    })

    return io
  }
}
