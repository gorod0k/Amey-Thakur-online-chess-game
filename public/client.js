const formEl = document.querySelectorAll('#joinForm > div > input')
const messageEl = document.querySelector('#message')
const statusEl = document.querySelector('#status')
const ChatEl = document.querySelector('#chat')
const sendButtonEl = document.querySelector('#send')
const roomsListEl = document.getElementById('roomsList');
const myAudioEl = document.getElementById('myAudio');
const singlePlayerEl = document.getElementById('singlePlayer');
const multiPlayerEl = document.getElementById('multiPlayer');
const totalRoomsEl = document.getElementById('rooms')
const totalPlayersEl = document.getElementById('players')
const chatContentEl = document.getElementById('chatContent')
const footer= document.getElementById('footer')

var config = {};
var board = null;
//var game = new Chess( )
var turnt = 0;
  
//—————————————————————————

//—————————————————————————

//—————————————————————————

//—————————————————————————

// singlePlayer
function onDragStart2 (source, piece, position, orientation)
{
    // do not pick up pieces if the game is over
    if (game.game_over()) {
        if (game.in_draw()) {
            alert('Game Draw!!');
        }
        else if (game.in_checkmate())
            if (turnt === 1) {
                alert('You won the game!!');
            } else {
                alert('You lost!!');
            }
        return false
    }
}

// update the board position after the piece snap for castling, en passant, pawn promotion
function onSnapEnd2()
{
    board.position(game.fen())
}

//Connection will be established after webpage is refreshed
const socket = io()

//Triggers after a piece is dropped on the board
// single player 
function onDrop2(source, target)
{
    // see if the move is legal
    var move = game.move({
        from: source,
        to: target,
        promotion: 'q' // NOTE: always promote to a queen for example simplicity
    })
    
    myAudioEl.play();
    // illegal move
    if (move === null) return 'snapback'
    turnt = 1 - turnt;
    // make random legal move for black
    window.setTimeout(makeRandomMove, 250)
}

//Update Status Event
socket.on('updateEvent', ({ status, fen, pgn }) => {
    statusEl.textContent = status
    fenEl.textContent = fen
    pgnEl.textContent = pgn
})

socket.on('printing', (fen) => {
    console.log(fen)
})


//To Update Status Element
socket.on('updateStatus', (turn) =>
{
    if (board.orientation().includes(turn)) {
        statusEl.textContent = "Your turn"
    }
    else {
        statusEl.textContent = "Opponent's turn"
    }
})



//Client disconnected in between
socket.on('disconnectedStatus', () =>
{
    msg_html_layer('Opponent left the game!')
})



//Receiving a message
socket.on('receiveMessage', (user, message) => {
    var chatContentEl = document.getElementById('chatContent')
    //Create a div element for using bootstrap
    chatContentEl.scrollTop = chatContentEl.scrollHeight;
    var divEl = document.createElement('div')
    if (formEl[0].value == user) {
        divEl.classList.add('myMessage');
        divEl.textContent = message;
    }
    else {
        divEl.classList.add('youMessage');
        divEl.textContent = message;
        document.getElementById('messageTone').play();
    }
    var style = window.getComputedStyle(document.getElementById('chatBox'));
    if (style.display === 'none') {
        document.getElementById('chatBox').style.display = 'block';
    }
    chatContentEl.appendChild(divEl);
    divEl.focus();
    divEl.scrollIntoView();

})

//Rooms List update
socket.on('roomsList', (rooms) =>
{
    // roomsListEl.innerHTML = null;
     console.log('Rooms List event triggered ',  rooms);
    totalRoomsEl.innerHTML = rooms.length
    var dropRooms = document.getElementById('dropRooms')
    while (dropRooms.firstChild) {
        dropRooms.removeChild(dropRooms.firstChild)
    }
    // added event listener to each room
    rooms.forEach(x => {
        var roomEl = document.createElement('div')
        roomEl.setAttribute('class', 'item')

        roomEl.setAttribute('data-value', x)
        roomEl.textContent = x;
        dropRooms.appendChild(roomEl)
    })
})

socket.on('updateTotalUsers', totalUsers => {
    console.log('updateTotalUsers: ', totalUsers)
    totalPlayersEl.innerHTML = totalUsers;
})

//Message will be sent only after you click the button
//sendButtonEl.addEventListener('click', (e) =>
$('#send').on( "click", function(event)
{
    event.preventDefault()
    var message = document.querySelector('#inputMessage').value
    var user = formEl[0].value
    var room = formEl[1].value
    document.querySelector('#inputMessage').value = ''
    document.querySelector('#inputMessage').focus()
    socket.emit('sendMessage', { user, room, message })
})

// Messages Modal
//document.getElementById('messageBox').addEventListener('click', e =>
$('#message').on( "click", function(event)
{
    event.preventDefault();
    var style = window.getComputedStyle(document.getElementById('chatBox'));
    if (style.display === 'none') {
        document.getElementById('chatBox').style.display = 'block';
    } else {
        document.getElementById('chatBox').style.display = 'none';
    }
})
