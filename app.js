'use strict'

const path = require('path')
const express = require('express')
let app = express()
const server = app.listen(3000)
const gameModel = require('./models/game.js')
const roomModel = require('./models/room.js')
const sentences = require('./public/sentences.js')
const io = require('./socket.js').startGame(server, roomModel, gameModel, sentences)

app.set('view engine', 'jade')
app.use(express.static(path.join(__dirname, '/views')))

app.get('/', (re, res) => {
  res.render('index')
})

app.get('/room/:roomname/status', (req, res) => {
  console.log('io value', req)
  let currentRoom = io.sockets.adapter.rooms[req.params.roomname] ? io.sockets.adapter.rooms[req.params.roomname] : undefined
  let roomInfo = {}

  if (!currentRoom) {
    currentRoom = 'Room does not exist!'
    res.send(currentRoom)
  } else {
    roomInfo.active_users = roomModel.getRoomActiveUsers(currentRoom)
    roomInfo.keystrokes = currentRoom.totalKeystrokes
    roomInfo.active_since = roomModel.getSecondsSinceRoomWasCreated(currentRoom)
    let meanScore = roomModel.getMeanScore(currentRoom)
    roomInfo.below_mean = roomModel.getBelowMeanUsers(meanScore, currentRoom)
    roomInfo.ranking = roomModel.getUsersRanking(currentRoom)
    roomInfo.last_minute_lead = currentRoom.finalWinner.username
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify(roomInfo))
  }
})

app.get('/room/:roomname/user/:username', (req, res) => {
  let room = {
    username: req.params.username,
    roomname: req.params.roomname
  }
  res.render('room', room)
})
