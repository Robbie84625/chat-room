const socketIO = require('socket.io');
const uuid = require('uuid');

let ChatDB = require("./models/chatDB").ChatDB;
ChatDB = new ChatDB();

const setupSocketServer = (server) => {
    const io = socketIO(server);

    io.on('connection', (socket) => {
        socket.on('joinRoom', (roomId) => {
            socket.join(roomId);
        });
    
        socket.on('sendMessage', async(data, roomId) => {
            await ChatDB.insertPersonalMessage(data.requesterID, data.recipientID, data.message);
            io.in(roomId).emit('receiveMessage', data)
        });
        //socket io設定
        socket.on('updateReadStatus', async (data) => {
            const { roomId, friendId,userId} = data;
            if (roomId && friendId) {
                socket.to(roomId).emit('readStatusUpdated', roomId);
                await ChatDB.updateReadStatus(userId,friendId);
            } else {
                console.error('Invalid data received in updateReadStatus:', data);
            }
        });

        
    });
}

module.exports = setupSocketServer;