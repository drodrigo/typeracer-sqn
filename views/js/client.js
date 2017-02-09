let currentSentence = ''
let listOfWords = []
let username
let roomData

socket.on('refreshCurrentUsers', (users) => {
  clearNewUsers()
  refreshCurrentUsers(users)
})

socket.on('userJoined', (userInfo) => {
  clearJoinedUsers()
  username = userInfo.username
  roomData = userInfo
  pushUsersNotification(username, ' has joined the room <br/>')
})

socket.on('userLeft', (username, users) => {
  clearJoinedUsers()
  pushUsersNotification(username, ' has left the room <br/>')
})

socket.on('newSentence', (sentence) => {
  currentSentence = sentence
  listOfWords = currentSentence.split(' ')
  pushSentenceToPlayer(sentence)
})

socket.on('startGame', () => {
  startGame()
  showTimer()
  hideStartButton()
})

socket.on('updateScore', (scoreData) => {
  updateScore(scoreData)
})

socket.on('timeRemaining', (gameDuration) => {
  showTimer(gameDuration)
})

socket.on('roundFinished', () => {
  socket.emit('resetScore', username)
})

socket.on('gameFinished', (scoreData) => {
  alert(scoreData.username + ' is the winner!!! ')
})
function startGame () {
  let el = document.getElementById('type-listener')
  el.addEventListener('keyup', function (event) {
    if (event.keyCode === 32 && (this.value.trim() === listOfWords[0])) {
      updateSentence()
      el.value = ''
      return false
    }
    let evaluation = checkInputValue(this.value, listOfWords[0])
    cleanHighlightInput()
    highlightInput(evaluation)
    if (evaluation && event.keyCode !== 8) {
      socket.emit('sendPlayerScore', username)
    }
  })
}

function updateSentence () {
  listOfWords.shift()
  if (listOfWords.length === 0) {
    socket.emit('sentenceFinished')
  } else {
    let newSentence = listOfWords.join().replace(/,/g, ' ')
    pushSentenceToPlayer(newSentence)
  }
}

function updateScore (scoreData) {
  let el = document.getElementById(scoreData.username)
  el.innerHTML = scoreData.username + ' ' + scoreData.score
}

function checkInputValue (inputValue) {
  let currentWord = listOfWords[0]
  let inputValueList = inputValue.split('')
  if (inputValueList.length > 0) {
    for (let i = 0; i < inputValueList.length; i++) {
      if (inputValueList[i] !== currentWord[i]) {
        return false
      }
    }
    return true
  } else {
    return false
  }
}

function pushSentenceToPlayer (sentence) {
  let el = document.getElementById('type-area')
  el.innerHTML = sentence
}

function highlightInput (evaluation) {
  let className = evaluation ? 'correct' : 'incorrect'
  let el = document.getElementById('type-listener')
  if (!el.classList.contains('incorrect')) {
    el.className += ' ' + className
  }
}

function cleanHighlightInput () {
  document.getElementById('type-listener').className = ''
}

function refreshCurrentUsers (users) {
  for (let properties in users) {
    for (let property in users[properties]) {
      if (property === 'name') {
        let el = document.getElementById('username')
        el.innerHTML += '<p id=\'' + users[properties][property] + '\'>' + users[properties][property] + '<p>'
      }
    }
  }
}

function pushUsersNotification (username, message) {
  let el = document.getElementById('joined')
  el.innerHTML += username + message
}

function clearNewUsers () {
  let el = document.getElementById('username')
  el.innerHTML = ''
}

function clearJoinedUsers () {
  let el = document.getElementById('joined')
  el.innerHTML = ''
}

function userReady () {
  let el = document.getElementById('start-button')
  el.innerHTML = 'Waiting for other players...'
  el.disabled = true
  socket.emit('userReady', roomData)
}

function showTimer (gameDuration) {
  let el = document.getElementById('time-remaining')
  el.innerHTML = 'Time remaining: ' + gameDuration + ' seconds'
}

function hideStartButton () {
  let el = document.getElementById('start-button')
  el.style.display = 'none'
}
