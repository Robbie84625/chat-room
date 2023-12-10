const router = require('express').Router();

const jwt = require('jsonwebtoken');

const bodyParser = require('body-parser');
let ChatDB = require("../models/chatDB").ChatDB;
ChatDB = new ChatDB();

const secretKey = process.env.jwt_secrect_key;
const dotenv = require("dotenv");
dotenv.config()

router.post('/getPersonalMessage', async (req, res) => {
    let requesterID = req.body.requesterID;
    let recipientID = req.body.recipientID;
    let timezone=req.body.timezone;
    let page = req.query.page || 0;
    let pageNumber = parseInt(page, 10);
    await ChatDB.updateReadStatus(requesterID,recipientID);
    const personalChatData = await ChatDB.chatRoomHistoryMsg(requesterID,recipientID,page,timezone);
    if (personalChatData.length < 11) {
        nextPage = null;
    } else {
        nextPage=pageNumber+1;
    }
    let personalChatDataResult = {
        "nextPage": nextPage,
        "data": personalChatData.slice(0, 10)
    };
    res.send(JSON.stringify(personalChatDataResult));
});

router.post('/getGroupMessage', async (req, res) => {
    let timezone=req.body.timezone;
    let guildID=req.body.guildID;
    let userID=req.body.userID;
    let page = req.query.page || 0;
    let pageNumber = parseInt(page, 10);
    await ChatDB.updateGroupReadStatus(guildID,userID);
    const groupChatData = await ChatDB.groupHistoryMsg(guildID,page,timezone);
    if (groupChatData.length < 11) {
        nextPage = null;
    } else {
        nextPage=pageNumber+1;
    }
    let groupChatDataResult = {
        "nextPage": nextPage,
        "data": groupChatData.slice(0, 10)
    };
    res.send(JSON.stringify(groupChatDataResult));
});

router.get('/getMessageData', async (req, res) => {
    const page = req.query.page || 0;
    const pageNumber = parseInt(page, 10);

    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, secretKey);
    let nextPage=0;
    const AllMessageData = await ChatDB.findAllMessage(decodedToken.userId,pageNumber);
        if (AllMessageData.length < 12) {
            nextPage = null;
        } else {
            nextPage=pageNumber+1;
        }
        let AllMessageDataResult = {
            "nextPage": nextPage,
            "data": AllMessageData.slice(0, 11)
        };
        res.send(JSON.stringify(AllMessageDataResult));
});

module.exports = { router};