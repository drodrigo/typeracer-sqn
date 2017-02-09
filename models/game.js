'use strict'

module.exports = {
  setNewUser: (username) => {
    const user = {
      name: username,
      score: 0
    }
    return user
  },

  setConnectionProperties: (socket, currentRoom, roomData) => {
    socket.username = roomData.username
    socket.room = roomData.roomname
    socket.sentenceCounter = 0
    socket.score = 0
  },

  setCurrentRoomProperties: function (currentRoom, socket) {
    if (!currentRoom.users) {
      currentRoom.users = {}
    }
    currentRoom.usersReady = 0
    currentRoom.currentWinner = {score: 0}
    currentRoom.finalWinner = {score: 0}
    currentRoom.roundTime = 60
    currentRoom.gameDuration = 180
    currentRoom.createdAt = new Date()
    currentRoom.roundTimeCounter = 0
    currentRoom.users[socket.id] = this.setNewUser(socket.username)
  },

  setCurrentWinner: (currentRoom, socket) => {
    var scoreData = {
      score: socket.score,
      username: socket.username
    }
    currentRoom.currentWinner = scoreData.score > currentRoom.currentWinner.score ? scoreData : currentRoom.currentWinner
  },

  setFinalWinner: (currentRoom) => {
    currentRoom.finalWinner = currentRoom.currentWinner.score > currentRoom.finalWinner.score ? currentRoom.currentWinner : currentRoom.finalWinner
  },

  updateScore: (io, socket) => {
    var scoreData = {
      username: socket.username,
      score: socket.score
    }
    io.sockets.in(socket.room).emit('updateScore', scoreData)
  },

  updatePlayerScore: (socket, currentRoom) => {
    currentRoom.users[socket.id].score = socket.score
  },

  increaseSentenceCounter: (socket) => {
    socket.sentenceCounter++
  },

  resetSentenceCounter: (socket) => {
    socket.sentenceCounter = 0
  },

  increasePlayerScore: (socket) => {
    socket.score += 1
  },

  resetScore: (socket) => {
    socket.score = 0
  }
}
