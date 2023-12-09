const socketIO = require('socket.io');
const uuid = require('uuid');

const cors = require("cors");
const corsOptions = {
    origin: 'https://chat-room.robbieliu.com', 
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, 
    optionsSuccessStatus: 204,
};

let ChatDB = require("./models/chatDB").ChatDB;
let LoginDB = require("./models/loginDB").LoginDB;

LoginDB = new LoginDB();
ChatDB = new ChatDB();

const setupSocketServer = (server) => {
    const io = socketIO(server, {
        cors: {
            origin: 'https://chat-room.robbieliu.com', 
            methods: ["GET", "POST"],
        },
    });

    io.on('connection', (socket) => {
        socket.on('myChannel', (channelId) => {
            socket.join(channelId);
        });

        socket.on('joinRoom', (roomId) => {
            socket.join(roomId);
        });

        socket.on('joinGroupRoom', (groupRoomId) => {
            socket.join(groupRoomId);
        });
    
        socket.on('sendMessage', async(data, roomId) => {
            await ChatDB.insertPersonalMessage(data.requesterID, data.recipientID, data.message,data.contentType);
            io.in(roomId).emit('receiveMessage', data);
        });

        socket.on('sendFile', async(data, roomId) => {
            await ChatDB.insertPersonalMessage(data.requesterID, data.recipientID, data.message,data.contentType);
            io.in(roomId).emit('receiveFile', data);
        });

        socket.on('sendMessageToFriend', async(data, memberReceiveId) => {
            io.in(memberReceiveId).emit('receiveFriendMessage', data);
        });

        socket.on('sendGroupMessage', async(data, groupRoomId) => {
            await ChatDB.insertGroupMessage(data.guildID,data.userId,data.message,data.groupMember,data.contentType);
            io.in(groupRoomId).emit('receiveGroupMessage', data)
        });

        socket.on('sendMessageToGroup', async(data, memberReceiveId) => {
            io.in(memberReceiveId).emit('receiveFromGroup', data);
        });

        socket.on('ringFriend', async(data, roomId) => {
            io.in(roomId).emit('receiveFriendRing', data);
        });

        socket.on('ringGroup', async(data, roomId) => {
            io.in(roomId).emit('receiveGroupRing', data);
        });

        socket.on('ring_friend', async(data, memberReceiveId) => {
            io.in(memberReceiveId).emit('receive_ring_friend', data);
        });

        socket.on('ring_group', async(data, memberReceiveId) => {
            io.in(memberReceiveId).emit('receive_ring_group', data);
        });

        socket.on('sendGroupFile', async(data, roomId) => {
            await ChatDB.insertGroupMessage(data.guildID,data.userId,data.message,data.groupMember,data.contentType);
            io.in(roomId).emit('receiveGroupFile', data);
        });

        socket.on('updateReadStatus', async (data) => {
            const { roomId, friendId,userId} = data;
            if (roomId && friendId) {
                socket.to(roomId).emit('readStatusUpdated', roomId);
                await ChatDB.updateReadStatus(userId,friendId);
            } else {
                console.error('Invalid data received in updateReadStatus:', data);
            }
        });

        socket.on('updateGroupReadStatus', async (data) => {          
            const { roomId, guildID,userId} = data;
            if (roomId && guildID) {
                socket.to(roomId).emit('readStatusUpdated', roomId);
                await ChatDB.updateGroupReadStatus(guildID,userId);
            } else {
                console.error('Invalid data received in updateReadStatus:', data);
            }
        });

        socket.on('login', async (data) => {
            socket.broadcast.emit('userOnline', { memberId: data.memberId });
            await LoginDB.updateToOnline(data.memberId);
        });
        socket.on('preDisconnect', async (data) => {
            socket.broadcast.emit('userOffline', { memberId: data.memberId });
            await LoginDB.updateToOffline(data.memberId);
        });
        
    });
}

module.exports = setupSocketServer;