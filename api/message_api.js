const router = require('express').Router();

const jwt = require('jsonwebtoken');

const bodyParser = require('body-parser');
let ChatDB = require("../models/chatDB").ChatDB;
ChatDB = new ChatDB();

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

module.exports = { router};