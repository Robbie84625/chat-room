const express = require('express');

const path = require('path');

const signUpRouter = require('./api/signUp_api').router;
const loginRouter = require('./api/login_api').router;

const app = express();
const port = 4000;

app.use(express.static(path.join(__dirname, 'static')));

app.set('views', __dirname + '/templates');
app.engine('html', require('ejs').renderFile);


// const player = require('play-sound')();

app.get("/", (req, res) => {
    res.render('homePage.html');
})

app.get("/chatRoom", (req, res) => {
    res.render('chatRoom.html');
})

app.use('/', signUpRouter);
app.use('/', loginRouter);
app.set('view engine', 'ejs');

app.listen(port, () => {
    console.log(`http://127.0.1:${port}`);
});

