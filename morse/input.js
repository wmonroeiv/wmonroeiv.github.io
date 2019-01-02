var numEvents = 0
var isDown = false
var lastDown = 0
var wpm = 20
var buffer = ''
var events = {}
var currEvent = null
var isPlaying = false
var isAnimating = false

var refTime = 0
var offset = 0

var morseTable = {
    '.-':   'A',
    '-...': 'B',
    '-.-.': 'C',
    '-..':  'D',
    '.':    'E',
    '..-.': 'F',
    '--.':  'G',
    '....': 'H',
    '..':   'I',
    '.---': 'J',
    '-.-':  'K',
    '.-..': 'L',
    '--':   'M',
    '-.':   'N',
    '---':  'O',
    '.--.': 'P',
    '--.-': 'Q',
    '.-.':  'R',
    '...':  'S',
    '-':    'T',
    '..-':  'U',
    '...-': 'V',
    '.--':  'W',
    '-..-': 'X',
    '-.--': 'Y',
    '--..': 'Z',

    '-----': '0',
    '.----': '1',
    '..---': '2',
    '...--': '3',
    '....-': '4',
    '.....': '5',
    '-....': '6',
    '--...': '7',
    '---..': '8',
    '----.': '9',

    '.-.-.-': '.',
    '--..--': ',',
    '..--..': '?',
    '.----.': "'",
    '-..-.':  '/',
    '-.--.':  '(',
    '-.--.-': ')',
    '.-...':  '&',
    '---...': ':',
    '-...-':  '=',
    '.-.-.':  '+',
    '-....-': '-',
    '.-..-.': '"',
    '.--.-.': '@',

    '-.-.--': '!',
    '-.-.-.': ';',
    '..--.-': '_',
    '...-...-': '$',

    '.--.-': 'À',
    '.-.-':  'Ä',
    '-.-..': 'Ç',
    '----':  'Š',
    '..-..': 'É',
    '..--.': 'Đ',
    '.-..-': 'È',
    '--.-.': 'Ĝ',
    '.---.': 'Ĵ',
    '--.--': 'Ñ',
    '...-...': 'Ś',
    '...-.': 'Ŝ',
    '.--..': 'Þ',
    '..--':  'Ü',
    '--..-.': 'Ź',
    '--..-': 'Ż',
}

var down = function(event) {
    if (!isDown) {
        isDown = true
        $('.button').css({'background-color': 'orange'})
        lastDown = +new Date()
        numEvents += 1
        if (currEvent !== null)
            currEvent.end = timeToCoords(lastDown)
        var element = document.createElement('span')
        $('.timebar')[0].appendChild(element)
        $(element).addClass('timing')
        $(element).addClass('dit')
        currEvent = events['eid-' + numEvents] = {
            id: 'eid-' + numEvents,
            type: 'down',
            start: timeToCoords(lastDown),
            end: null,
            element: $(element),
        }

        // tone().play()
        tone().muted = false
    }
    if (!isAnimating)
        setTimeout(runAnimation, 1000 / 60)
    event.preventDefault()
}

var up = function(event) {
    if (isDown && currEvent !== null) {
        var dot = dotMillis()
        var now = +new Date()
        var len = (now - lastDown) / dot
        if (len > 2.0)
            buffer += '-'
        else
            buffer += '.'
        numEvents += 1

        if (currEvent !== null) {
            currEvent.end = timeToCoords(now)
            if (len > 2.0) {
                currEvent.element.removeClass('dit')
                currEvent.element.addClass('dah')
            } else {
                currEvent.element.removeClass('dah')
                currEvent.element.addClass('dit')
            }
        }

        var element = document.createElement('span')
        $('.timebar')[0].appendChild(element)
        $(element).addClass('timing')
        $(element).addClass('gap')
        currEvent = events['eid-' + numEvents] = {
            id: 'eid-' + numEvents,
            type: 'up',
            start: timeToCoords(now),
            end: null,
            element: $(element),
        }
        animate()

        var i = numEvents
        setTimeout(function() { closeLetter(i, now, dot) }, dot * 2)
        setTimeout(function() { closeWord(i, now, dot) }, dot * 5)
    }

    isDown = false
    $('.button').css({'background-color': 'red'})
    // tone().pause()
    tone().muted = true
    event.preventDefault()
}

var closeLetter = function(i, lastUp, dot) {
    if (numEvents !== i) return
    if (currEvent !== null) {
        currEvent.element.removeClass('gap')
        currEvent.element.addClass('letterspace')
    }
    var char = morseTable[buffer]
    if (typeof(char) !== 'undefined')
        $('.input').append(char)
    buffer = ''
}

var closeWord = function(i, lastUp, dot) {
    if (numEvents !== i) return
    if (currEvent !== null) {
        delete events[currEvent.id]
        currEvent.element.remove()
        currEvent = null
    }
    $('.input').append(' ')
}

var dotMillis = function() {
    return 60 / (wpm / 20)
}

var tone = function() {
    if (typeof(toneAudio) === 'undefined') {
        toneAudio = new Audio('tone.mp3')
        toneAudio.preload = 'auto'
        toneAudio.muted = true
        toneAudio.loop = true
        toneAudio.load()
    }
    if (!isPlaying) {
        var promise = toneAudio.play()
        if (typeof(promise) !== 'undefined')
            promise.then(function() {}).catch(function(e) {})
    }
    return toneAudio
}

var backspace = function(event) {
    $('.input').html($('.input').html().trim().slice(0, -1) + ' ')
    event.preventDefault()
}

var clear = function(event) {
    $('.input').html('')
    event.preventDefault()
}

var wpmNum = function(valueStr) {
    var value = +valueStr
    if (isNaN(value) || value <= 0)
        return

    $('#wpm-slider').val(value)
    resetWpm(value)
}

var wpmSlider = function(valueStr) {
    var value = +valueStr
    if (isNaN(value))
        return

    $('#wpm-num').val('' + value)
    resetWpm(value)
}

var resetWpm = function(value) {
    var now = +new Date()
    offset = timeToCoords(now)
    wpm = value
    refTime = now
}

var runAnimation = function() {
    if (animate())
        setTimeout(runAnimation, 1000 / 60)
}

var updateShow = function(checked) {
    if (checked) {
        $('.collapse').removeClass('hidden')
    } else {
        $('.collapse').addClass('hidden')
    }
}

var animate = function() {
    var currCoord = timeToCoords(+new Date())
    var cleanup = []
    var hasEvents = false
    for (eid in events) {
        if (eid.startsWith('eid-')) {
            var event = events[eid]
            if (event.end !== null && currCoord - event.end > 60) {
                cleanup.push(event.id)
            } else {
                var left = 'calc(100% - ' + (currCoord - event.start) + 'em)'
                var width = (event.end === null ? '60em' : (event.end - event.start) + 'em')
                event.element.css({left: left, width: width})
                if (event.type === 'down' && event.end === null && currCoord - event.start > 2) {
                    event.element.removeClass('dit')
                    event.element.addClass('dah')
                }
                hasEvents = true
            }
        }
    }
    cleanup.forEach(function(eid) {
        events[eid].element.remove()
        delete events[eid]
    })
    return hasEvents
}

var timeToCoords = function(time) {
    return (time - refTime) / dotMillis() + offset
}

$(document).ready(function() {
    $('.button').mousedown(down)
    $('.button').mouseup(up)

    $('#backspace').mouseup(backspace)
    $('#clear').mouseup(clear)

    $('#show').on('input', function(evt) { updateShow(this.checked) })
    $('#wpm-num').on('input', function(evt) { wpmNum(this.value) })
    $('#wpm-slider').on('input', function(evt) { wpmSlider(this.value) })

    $(document).keydown(function(event) {
        if (event.which === 32) down(event)
        else if (event.which === 8 && !$('#wpm-num').is(':focus')) backspace(event)
        else if (event.which === 192) clear(event)
    })
    $(document).keyup(function(event) {
        if (event.which === 32) up(event)
    })

    tone()
    refTime = +new Date()
    wpmSlider($('#wpm-slider')[0].value)
    updateShow($('#show')[0].checked)
})
