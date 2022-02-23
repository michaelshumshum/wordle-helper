var guessStatus = resetGuessStatus()

function resetGuessStatus() {
  return new Object({
    'green': {
      'letters': ['', '', '', '', ''],
      'set': function(letter, index) {
        this.letters[index] = letter.toLowerCase()
      },
    },
    'yellow': {
      'letters': {},
      'add': function(letter, index) {
        if (this.letters[letter] == undefined) {
          this.letters[letter] = [index]
        } else {
          this.letters[letter].push(index)
        }
      },
      'remove': function(letter) {
        delete this.letters[letter]
      },
    },
    'grey': {
      'letters': [],
      'add': function(letter) {
        this.letters.push(letter)
      }
    }
  })
}

function filterSearchList() {
  var newList = []
  for (var i = 0; i < wordsList.length; i++) {
    var word = wordsList[i]
    if (guessStatus.green.letters.some(
        function(letter, index) {
          if (letter == '') return false
          return (letter != word[index])
        })) continue
    if (Object.keys(guessStatus.yellow.letters).some(function(x) {
        return !word.includes(x)
      })) continue
    if (word.split('').some(
        function(letter, index) {
          if (guessStatus.yellow.letters[letter] == undefined) {
            return false
          } else if (guessStatus.yellow.letters[letter].some((x) => {
              return x == index
            })) {
            return true
          } else {
            return false
          }
        })) continue
    if (guessStatus.grey.letters.some(function(letter) {
        console.log(word);
        console.log(letter);
        return word.includes(letter)
      })) continue
    newList.push(word)
  }
  return newList
}

function cheatWord() {
  let start = 1624032000
  var now = Math.floor(Date.now() / 1000)
  var index = Math.floor((now - start) / 86400)
  return orderedWordsList[index]
}

function addYellowLettersRow() {
  let parent = document.getElementById('yellow-letters')
  let group = document.createElement('div')
  group.classList.add('grid-group')

  var element = document.createElement('input')
  element.type = 'text'
  element.maxLength = '1'
  element.classList.add('yellow-input')
  group.appendChild(element)
  for (var i = 0; i < 5; i++) {
    var element = document.createElement('div')
    element.classList.add('checkbox')
    group.appendChild(element)
  }
  parent.appendChild(group)
}

function removeYellowLettersRow(e) {
  let parent = document.getElementById('yellow-letters')
  if (parent.childNodes.length < 4) return
  parent.removeChild(parent.lastChild)
}

function guessHelper(e) {
  searchList = [...wordsList]
  let grid = document.getElementById('words-results')
  grid.innerHTML = ''
  Array.prototype.slice.call(document.getElementsByClassName('green-input')).forEach(function(element, index) {
    if (element.value == undefined) {
      guessStatus.green.set('', index)
    } else {
      guessStatus.green.set(element.value, index)
    }
  })
  Array.prototype.slice.call(document.getElementById('yellow-letters').getElementsByClassName('grid-group')).forEach(function(element) {
    var children = element.childNodes
    let letter = children[0].value
    if (letter == '' || letter == undefined) return
    var positions = []
    for (i = 1; i < children.length; i++) {
      if (children[i].tagName == 'H3' || children[i].tagName == undefined) continue
      if (children[i].classList.contains('active')) positions.push(i - 1)
    }
    guessStatus.yellow.letters[letter.toLowerCase()] = [...positions]
  })
  guessStatus.grey.letters = []
  Array.prototype.slice.call(document.getElementById('grey-letters').getElementsByClassName('grid-group')).forEach(function(group) {
    Array.prototype.slice.call(group.childNodes).filter(function(node) {
      return node.tagName == 'INPUT'
    }).forEach(function(node) {
      if (node.value != '') guessStatus.grey.add(node.value.toLowerCase())
    })
  })
  var searchList = filterSearchList()
  for (var i = 0; i < searchList.length; i++) {
    var element = document.createElement('h4')
    element.classList.add('word-result')
    searchList[i].split('').forEach(function(letter) {
      var span = document.createElement('span')
      span.innerText = letter
      if (guessStatus.green.letters.includes(letter)) {
        span.classList.add('green-span')
      } else if (Object.keys(guessStatus.yellow.letters).includes(letter)) {
        span.classList.add('yellow-span')
      } else {
        span.classList.add('grey-span')
      }
      element.appendChild(span)
    })
    grid.appendChild(element)
  }
}

function greyLettersRow(e) {
  let gridGroups = document.getElementById('grey-letters').querySelectorAll('div.grid-group')
  let nodes = Array.prototype.slice.call(gridGroups[gridGroups.length - 1].childNodes).filter(function(node) {
    return node.tagName == 'INPUT'
  })
  if (nodes.every(function(node) {
      return node.value != ''
    })) {
    let group = document.createElement('div')
    group.classList.add('grid-group')
    for (var i = 0; i < 6; i++) {
      var element = document.createElement('input')
      element.type = 'text'
      element.maxLength = 1
      element.classList.add('grey-input')
      group.appendChild(element)
    }
    document.getElementById('grey-letters').appendChild(group)
  } else if (nodes.every(function(node) {
      return node.value == ''
    })) {
    if (gridGroups.length > 1) document.getElementById('grey-letters').removeChild(gridGroups[gridGroups.length - 1])
  }
}

document.addEventListener('DOMContentLoaded', function(event) {
  var eventListeners = [{
      'element': document.getElementById('yellow-letters'),
      'event': 'mousedown',
      'function': function(e) {
        if (e.target.classList.contains('checkbox')) {
          if (e.target.classList.contains('active')) {
            e.target.classList.remove('active')
            e.target.innerHTML = ''
          } else {
            e.target.classList.add('active')
            e.target.innerHTML = '<div class="cross"></div>'
          }
        }
      },
    },
    {
      'element': document.getElementById('yellow-add-row'),
      'event': 'mousedown',
      'function': addYellowLettersRow
    },
    {
      'element': document.getElementById('yellow-remove-row'),
      'event': 'mousedown',
      'function': removeYellowLettersRow
    },
    {
      'element': window,
      'event': 'input',
      'function': guessHelper
    },
    {
      'element': window,
      'event': 'mousedown',
      'function': guessHelper
    },
    {
      'element': document.getElementById('reset'),
      'event': 'mousedown',
      'function': function(e) {
        window.location.reload()
      }
    },
    {
      'element': document.getElementById('grey-letters'),
      'event': 'input',
      'function': greyLettersRow
    }
  ]
  addYellowLettersRow()
  guessHelper()
  for (var i = 0; i < eventListeners.length; i++) {
    var x = eventListeners[i]
    x.element.addEventListener(x.event, x.function)
  }
})