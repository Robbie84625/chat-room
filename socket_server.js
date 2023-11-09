const http = require('http');
const socketIO = require('socket.io');

const server = http.createServer();
const io = socketIO(server);

// Setup connection event
module.exports = (http) => {
    io.on('connection', (socket) => {
        console.log('使用者已連線');

        socket.on('sendFriendRequest', (friendEmail) => {
            // 在這裡處理好友邀請的邏輯，可以與資料庫互動等
            // ...

            // 範例：發送好友邀請通知
            io.emit('friendRequestNotification', '你收到一個好友邀請！');
        });
    });
};

module.exports.server = server;
module.exports.io = io;