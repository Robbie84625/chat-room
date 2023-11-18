const socketIO = require('socket.io');

function setupSocketServer(server) {
    const io = socketIO(server);

    io.on('connection', (socket) => {
        console.log('A user connected');
        console.log("已經連接完成"); // 添加這行代碼
    });
}
module.exports = setupSocketServer;