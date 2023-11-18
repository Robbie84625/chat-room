const router = require('express').Router();

const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');


let FriendDB = require("../models/friendDB").FriendDB;

const secretKey = process.env.jwt_secrect_key;
router.use(bodyParser.json());
FriendDB = new FriendDB();

const dotenv = require("dotenv");
dotenv.config();

router.get('/getFriendData', async (req, res) => {
    const page = req.query.page || 0;
    const keyword = req.query.keyword;
    const pageNumber = parseInt(page, 10);

    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, secretKey);
    let nextPage=0;
    if(!keyword){
        const friendshipData = await FriendDB.findFriendship(decodedToken.userId,pageNumber);
        if (friendshipData.length < 7) {
            nextPage = null;
        } else {
            nextPage=pageNumber+1;
        }
        let friendshipDataResult = {
            "nextPage": nextPage,
            "data": friendshipData.slice(0, 7)
        };
        res.send(JSON.stringify(friendshipDataResult));
    }
    if (keyword){
        const friendshipData = await FriendDB.findFriendship_By_KeyWord(decodedToken.userId,keyword,pageNumber);
        if (friendshipData.length < 7) {
            nextPage = null;
        } else {
            nextPage=pageNumber+1;
        }
        let friendshipDataResult = {
            "nextPage": nextPage,
            "data": friendshipData.slice(0, 7)
        };
        res.send(JSON.stringify(friendshipDataResult));
    }
    
    

    // let sendInvite = [];
    // let receiveInvite = [];

    
    // for (let index of friendshipStatusData.slice(0, 7)){
    //     if(index.requesterID===userId){
    //         sendInvite.push(index);
    //     }
    //     else if(index.friendID===userId){
    //         receiveInvite.push(index);
    //     }
    // }
    // let friendshipStatusResult = {
    //     "nextPage": nextPage,
    //     "data": {
    //         "sendInvite": sendInvite,
    //         "receiveInvite": receiveInvite
    //     }
    // };
    // res.send(JSON.stringify(friendshipStatusResult));
});

module.exports = { router};