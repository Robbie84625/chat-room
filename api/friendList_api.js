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
        if (friendshipData.length < 11) {
            nextPage = null;
        } else {
            nextPage=pageNumber+1;
        }
        let friendshipDataResult = {
            "nextPage": nextPage,
            "data": friendshipData.slice(0, 10)
        };
        res.send(JSON.stringify(friendshipDataResult));
    }
    if (keyword){
        const friendshipData = await FriendDB.findFriendship_By_KeyWord(decodedToken.userId,keyword,pageNumber);
        if (friendshipData.length < 11) {
            nextPage = null;
        } else {
            nextPage=pageNumber+1;
        }
        let friendshipDataResult = {
            "nextPage": nextPage,
            "data": friendshipData.slice(0, 10)
        };
        res.send(JSON.stringify(friendshipDataResult));
    }
    
});

module.exports = { router};