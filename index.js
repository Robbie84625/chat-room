const express = require('express');
const path = require('path');
const http = require('http'); 
const socketServer = require('./socket_server');

const messageRouter = require('./api/message_api').router;
const signUpRouter = require('./api/signUp_api').router;
const loginRouter = require('./api/login_api').router;
const chatRoomRouter = require('./api/chatRoom_api').router;
const addFriendRouter = require('./api/addFriend_api').router;
const friendListRouter = require('./api/friendList_api').router;
const noticeRouter = require('./api/notice_api').router;
const userInfoRouter = require('./api/userInfo_api').router;
const groupRouter = require('./api/group_api').router;

const app = express();
const port = 4000;

const server = http.createServer(app);
socketServer(server);

app.use(express.static(path.join(__dirname, 'static')));

app.set('views', __dirname + '/templates');
app.engine('html', require('ejs').renderFile);

app.get("/chatRoom", (req, res) => {
    res.render('chatRoom.html');
})

app.get("/", (req, res) => {
    res.render('homePage.html');
})

app.use('/', signUpRouter);
app.use('/', loginRouter);
app.use('/', chatRoomRouter);
app.use('/', addFriendRouter);
app.use('/', noticeRouter);
app.use('/', userInfoRouter);
app.use('/', friendListRouter);
app.use('/',messageRouter);
app.use('/',groupRouter);
app.set('view engine', 'ejs');

server.listen(port, () => {
    console.log(`Server running at http://127.0.0.1:${port}`);
});
