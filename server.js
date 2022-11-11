const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');

const { Server } = require('socket.io');
const { disconnect } = require('process');

app.use(cors()); // Cors middleware

const server = http.createServer(app);

// Create an io server and 
// Allow for CORS from http://localhost:3000 GET and POST methods
const io = new Server(server, {
    cors: {
      origin: 'https://client-zero-trace.onrender.com/',
      methods: ['GET', 'POST'],
    },
});



let chatRoom = ''
let allUsers = [] // All users in chat room

io.on('connection', (socket) => {

    console.log(`User connected ${socket.id}`)
  
    // Event-listeners 

    // Add a user to a room
    socket.on('join_room', (data) => {

        const { name, room } = data;
         // Data sent from client when join_room event emitted
        socket.join(room); // Join the user to a socket room

        // Current timestamp
        let __createdtime__ = Date.now(); 

        

        // Save the new user to the room
        chatRoom = room;
        allUsers.push({ id: socket.id, name, room });
        chatRoomUsers = allUsers.filter((user) => user.room === room);
        
        socket.to(room).emit('chatroom_users', chatRoomUsers);
        socket.emit('chatroom_users', chatRoomUsers);


    });

    // Send message
    socket.on('send_message', (data) => {
        const { message, username, room, __createdtime__ } = data;
        io.in(room).emit('receive_message', data); // Send to all users in room, including sender
        
    });

    // Disconnect 
    socket.on('disconnect', () => {
        console.log('User disconnected from the chat');
        const user = allUsers.find((user) => user.id == socket.id);
        if (user?.username) {
          allUsers = leaveRoom(socket.id, allUsers);
          socket.to(chatRoom).emit('chatroom_users', allUsers);
          socket.to(chatRoom).emit('receive_message', {
            message: `${user.username} has disconnected from the chat.`,
          });
        }
    });

});


// Router
app.get('/', (req, res) => {
    res.send('Hello world');
});

server.listen(process.env.PORT || 3000, () => 'Server is running on port 5000');