const router = require('express').Router();

const bodyParser = require('body-parser');


let FriendDB = require("../models/friendDB").FriendDB;
let NoticeDB = require("../models/noticeDB").NoticeDB;


router.use(bodyParser.json());

FriendDB = new FriendDB();
NoticeDB = new NoticeDB();

const dotenv = require("dotenv");
dotenv.config();

router.get('/getInviteData', async (req, res) => {
    const page = req.query.page || 0;
    const pageNumber = parseInt(page, 10);

    const userId = req.userData.userId;
    const friendshipStatusData = await FriendDB.findFriendshipStatus(userId,pageNumber);
    let nextPage=0;


    if (friendshipStatusData.length < 11) {
        nextPage = null;
    } else {
        nextPage=pageNumber+1;
    }

    let sendInvite = [];
    let receiveInvite = [];

    
    for (let index of friendshipStatusData.slice(0, 10)){
        if(index.requesterID===userId){
            sendInvite.push(index);
        }
        else if(index.friendID===userId){
            receiveInvite.push(index);
        }
    }
    let friendshipStatusResult = {
        "nextPage": nextPage,
        "data": {
            "sendInvite": sendInvite,
            "receiveInvite": receiveInvite
        }
    };
    res.send(JSON.stringify(friendshipStatusResult));
});

router.post("/cancelInvitation", async (req, res) => {
    const token = req.headers.authorization;

    if (!token) {
        res.status(401).send({ status: "error", message: "未經授權請求" });
        return;
    }

    try { 
        let invitationId = BigInt(req.body.invitationId);
        if (invitationId) {
            const result = await NoticeDB.deleteInvite(invitationId);
            if (result === '刪除成功') {
                res.status(200).send({ status: "success" });
            } else {
                res.status(500).send({ status: "error", message: "刪除失敗" });
            }
        } 
    } catch (err) {
        res.status(500).send({ status: "error", message: "內部伺服器出現錯誤" });
    }
});



module.exports = {router};