var page = -1
var startActive = false
var first = new Date()
var last = new Date()

var buttonText = function(n) {
    if (n < 0)
        return 'Ready'
    else if (n == 0)
        return 'Start video'
    else
        return 'Turn page'
}

var pageText = function(n) {
    if (n < 0)
        return 'Start'
    else if (n == 0)
        return 'Title page'
    else
        return 'Page ' + n
}

var padNum = function(num, before, after, intOnly) {
    if (intOnly)
        return Math.round(num).toString().padStart(before, "0");

    var arr = num.toString().split(".")
    arr[0] = arr[0].padStart(before, "0")
    if (arr.length == 1) {
        arr[1] = '.';
    }
    arr[arr.length - 1] = arr[arr.length - 1].padEnd(after, 0)
    return arr.join(".")
}

var formatTD = function(totalMsecs) {
    var msecs = totalMsecs % 60000
    var totalMins = (totalMsecs - msecs) / 60000
    var mins = totalMins % 60
    var hours = (totalMins - mins) / 60
    return '' + hours + ':' + padNum(mins, 2, 0, true) + ':' + padNum(msecs / 1000, 2, 3)
}

var start = function(evt) {
    startActive = true
    $('#countdown').addClass('show')
    $('#countdown-three').addClass('countdown')
    setTimeout(function () {
        $('#countdown-two').addClass('countdown')
    setTimeout(function () {
        $('#countdown-one').addClass('countdown')
    setTimeout(function () {
        $('#countdown-play').addClass('countdown')
        $('#countdown').addClass('play')
        first = new Date
        startActive = false
    }, 1000)
    }, 1000)
    }, 1000)
}

var turn = function(evt) {
    $('#turn').blur()

    if (startActive) return

    $('#page_nums').append('<p>' + pageText(page) + '</p>')

    page++
    var t = new Date()
    var delta = t - last
    var stamp = t - first
    last = t

    if (page == 0) {
        start()
    } else {
        $('#countdown').removeClass('show')
        $('#page_times').append('<p>' + formatTD(stamp) + '</p>')
        if (page > 1)
            $('#page_diffs').append('<p>' + formatTD(delta) + '</p>')
    }

    $('#turn').text(buttonText(page))
}

$(document).ready(function() {
    $(document).keyup(turn)
    $('#turn').click(turn)
})
