'use strict'

module.exports = {
  getRoomActiveUsers: (room) => {
    const activeUsers = Object.keys(room.users).length
    return activeUsers
  },

  setTotalKeystrokes: (currentRoom) => {
    let totalKeystrokes = 0
    for (let userId in currentRoom.users) {
      totalKeystrokes += currentRoom.users[userId]['score']
    }
    currentRoom.totalKeystrokes = totalKeystrokes
  },

  getSecondsSinceRoomWasCreated: (currentRoom) => {
    const timeInMilliseconds = (new Date() - currentRoom.createdAt) / 1000
    return parseFloat(timeInMilliseconds).toFixed(0)
  },

  getMeanScore: (currentRoom) => {
    if (!currentRoom.totalKeystrokes) {
      return 0
    }
    const meanScore = currentRoom.totalKeystrokes / currentRoom.length
    return meanScore
  },

  getUsersRanking: (currentRoom) => {
    let rankingList = []
    for (let userId in currentRoom.users) {
      rankingList.push(currentRoom.users[userId])
    }
    rankingList.sort((currentPlayer, nextPlayer) => {
      return nextPlayer.score - currentPlayer.score
    })
    return rankingList
  },

  getBelowMeanUsers: (meanScore, currentRoom) => {
    let totBelowMeanUsers = 0
    for (let userId in currentRoom.users) {
      if (currentRoom.users[userId]['score'] < meanScore) {
        totBelowMeanUsers++
      }
    }

    return totBelowMeanUsers
  },

  resetRoomCounters: (currentRoom) => {
    currentRoom.roundTimeCounter = 0
    currentRoom.totalKeystrokes = 0
  },

  decreaseUsersReadyCounter: (currentRoom) => {
    currentRoom.usersReady -= 1
  },

  increaseUsersReadyCounter: (currentRoom) => {
    currentRoom.usersReady += 1
  },

  deletePlayerFromRoom: (socket, currentRoom) => {
    delete currentRoom.users[socket.id]
  },

  increaseRoundTimeCounter: (currentRoom) => {
    currentRoom.roundTimeCounter++
  },

  decreaseGameDuration: (currentRoom) => {
    currentRoom.gameDuration -= 1
  }
}
