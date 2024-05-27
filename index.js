const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')

// be carefully: v.0.10 and 1.0 have many differences!
const Chess = require('chess.js').Chess;
// API here: https://unpkg.com/browse/chess.js@1.0.0-beta.8/README.md

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, './public')

app.use(express.static(publicDirectoryPath))

// const Data = new Map()
const gameData = new Map()
const userData = new Map()
const roomsList = new Set()

let totalUsers = 0;

//Getting a connection
io.on('connection', (socket) =>
{
	console.log("socket.io: User connected: ", socket.id);

    totalUsers++;
    // console.log(totalUsers)
    // console.log(roomsList)
    //To render rooms list initially
    io.emit('roomsList', Array.from(roomsList));
    io.emit('updateTotalUsers', totalUsers)
    
    const updateStatus = (game, room) =>
{
        // checkmate?
        /*
const possibleMoves = game.moves();
if ( game.isGameOver() )
{
if ( game.isDraw() ) ...
if (possibleMoves.length === 0) ...
} */
        if (game.isCheckmate()) {
            io.to(room).emit('gameOver', game.turn(), true)
        }
        // draw? 
        else if (game.isDraw()) {
            io.to(room).emit('gameOver', game.turn(), false)
        }
        // game still on
        else {
            if (game.inCheck()) {
                io.to(room).emit('inCheck', game.turn())
            }
            else
{
                io.to(room).emit('updateStatus', game.turn())
            }
        }
} // updateStatus

//Creating and joining the room
socket.on('joinRoom', ({ user, room, start_pos }, callback) =>
{
	console.log('Join room / user: ', user, ', room: ' , room);
	
        //We have to limit the number of users in a room to be just 2
if (io.sockets.adapter.rooms.get(room) )
if (io.sockets.adapter.rooms.get(room).size ===2 )
            return callback('Already 2 users are there in the room!')

        var alreadyPresent = false
        for (var x in userData) {
console.log(userData[x]);
            if (userData[x].user == user && userData[x].room == room) {
                alreadyPresent = true
            }
        }

        //If same name user already present
        if (alreadyPresent) {
            return callback('Choose different name!')
        }
        
        socket.join(room)
        //Rooms List Update
        roomsList.add(room);
        io.emit('roomsList', Array.from(roomsList));
        totalRooms = roomsList.length
        io.emit('totalRooms', totalRooms)
        userData[user + "" + socket.id] = {
            room, user,
            id: socket.id
        }
        
        console.log( io.sockets.adapter.rooms.get(room) , ' : ', io.sockets.adapter.rooms.get(room).size)
        
// If two users are in the same room, we can start
if (io.sockets.adapter.rooms.get(room).size ===2 )
{
            //Rooms List Delete
            roomsList.delete(room);
            io.emit('roomsList', Array.from(roomsList));
            totalRooms = roomsList.length
            io.emit('totalRooms', totalRooms)
            
            var game = new Chess()
game.load(start_pos)
            // getting ids of the clients
            // Set room(socket.id : game)
            io.sockets.adapter.rooms.get(room).forEach( (value) =>
{ gameData.set( value, game ) });
            //For giving turns one by one
    //        io.to(room).emit('Dragging', socket.id)

            io.to(room).emit('InitBoard', game.fen(), socket.id, game.pgn())
            updateStatus(game, room)
        }
}) // socket.on('joinRoom'

/*
socket.on('SetStartPos', ( FEN_pos ) =>
{
	var game = gameData.get(socket.id)
	//console.log('socket.on SetStartPos: ', socket.id, ' / ', FEN_pos, ' / ', game)
	game.load(FEN_pos)
	console.log( game.fen() )
})
*/

//For catching dropped event
socket.on('Dropped', (move, room) =>
{
      var game = gameData.get(socket.id) // gameData[socket.id]
//console.log('gameData: ', [...gameData.entries()])

// добавить обработчик ошибочных ходов! иначе сервер падает с ошибкой
        var result= game.move({ from: move.from, to: move.to, promotion: move.promotion })
        console.log('Room: ', room, ' : res ', result)
        // If correct move, then toggle the turns
        
if (result != null)
io.to(room).emit('Dragging', socket.id, game.turn() )

// update boards position:
console.log('socket emit UpdateBoard: ', room, ' / ', game.fen() )
io.to(room).emit( 'UpdateBoard', socket.id, game.fen() )

        updateStatus(game, room)
        io.to(room).emit('printing', game.fen())
}) // socket.on Dropped



//Catching message event
socket.on('sendMessage', ({ user, room, message }) =>
{ io.to(room).emit('receiveMessage', user, message) })
   
   
   
//Disconnected
socket.on('disconnect', () =>
{
	console.log("socket.io: User disconnected: ", socket.id);
	
        totalUsers--;
        io.emit('updateTotalUsers', totalUsers)
        var room = '', user = '';
        for (var x in userData)
{
            if (userData[x].id == socket.id) {
                room = userData[x].room
                user = userData[x].user
                delete userData[x]
            }
       }

        //Rooms Removed
        if (userData[room] == null) {
            //Rooms List Delete
            roomsList.delete(room);
            io.emit('roomsList', Array.from(roomsList)); 
            totalRooms = roomsList.length
            io.emit('totalRooms', totalRooms)
        }
        gameData.delete(socket.id)
        if (user != '' && room != '') {
            io.to(room).emit('disconnectedStatus');
        }
    })
})

server.listen(port, () =>
{
	console.log(`Server is up on port ${port}!`)
})

