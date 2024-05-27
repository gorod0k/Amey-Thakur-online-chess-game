# ONLINE CHESS

!!! https://github.com/shaack/chess-console?tab=readme-ov-file
!!! https://shaack.com/projekte/cm-chessboard
https://github.com/shaack/cm-chessboard

Based on https://github.com/Amey-Thakur/ONLINE-CHESS-GAME
Demo:
https://amey-thakur-online-chess-game.onrender.com

NPM modules:
path
http
chess.js
express
socket.io

Docs for libs:
Chessboard lib documentation: https://chessboardjs.com/docs
Chess lib documentation: www.npmjs.com/package/chess.js
perfect alternative Chessboard library:
https://caustique.github.io/chessboard-js

nice article about socket io and online gameplay 
https://medium.com/@manjulajayawardana/lets-build-our-own-online-multiplayer-chess-game-ba7d56d00700
https://www.slmanju.com/2024/01/lets-build-our-own-online-multiplayer.html

game processing:
1. onDrop -> game.move
When a player moves a piece on the chess board, client send this data to the server with a message move.
2. socket.on('Dropped -> io.to(room).emit('Dragging', io.to(room).emit('DisplayBoard', io.to(room).emit('updateStatus
The server receives a message and broadcast messages move to all clients in a room.
3. The client(s) receive(s) the message move with the data will update its chessboard state.

Todo: 
выкинуть нахер semantic UI 

реализовать html layer для:
socket.on('gameOver', (turn, win) 
socket.on('inCheck', turn => {