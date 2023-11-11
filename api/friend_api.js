const router = require('express').Router();

const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');


let FriendDB = require("../models/friendDB").FriendDB;

const secretKey = process.env.jwt_secrect_key;
router.use(bodyParser.json());
FriendDB = new FriendDB();

const dotenv = require("dotenv");
dotenv.config();


router.post("/selectNewFriend", async (req, res) => {
    try {

        const newFriendData = await FriendDB.findNewFriend(req.body.email);

        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, secretKey);

        if (!newFriendData || newFriendData.length === 0) {
            return res.status(400).json({ status: "error", message: "無此用戶" });
        }
        
        else if (newFriendData[0].memberId === decodedToken.userId) {
            return res.status(400).json({ status: "error", message: "這不是您自己嗎?" , newFriendData: newFriendData });
        } 
        else {
            const checkFriendship = await FriendDB.checkFriendship(decodedToken.userId, newFriendData[0].memberId);
            if (checkFriendship) {
                return res.status(400).json({ status: "error", message: "你們已經是好友!" , newFriendData: newFriendData});
            } 
            else {
                return res.status(200).json({ status: "success", message: "請問是你要找的夥伴嗎?", newFriendData: newFriendData });
            }
        }

    } catch (err) {
        res.status(500).send({ status: "error", message: "內部伺服器出現錯誤" });
    }

});

router.post("/sendFriendInvitation", async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, secretKey);

        let friendId=req.body.data.memberId
        let requesterID=decodedToken.userId
        let invitationStatus = "PendingConfirmation";

        const checkFriendInvitation= await FriendDB.checkFriendInvitation(requesterID,friendId,"PendingConfirmation");
        if (checkFriendInvitation) {
            await FriendDB.createFriendInvitation(requesterID, friendId,invitationStatus);
            return res.status(200).json({ status: "success", message: "成功發出邀請"});
        } 
        else {
            return res.status(400).json({ status: "error", message: "請確認通知是否有待確認或已發送好友邀請" });
        }

    } catch (err) {
        res.status(500).send({ status: "error", message: "內部伺服器出現錯誤" });
    }
});

router.post("/buildFriendship", async (req, res) => {
    try {
        const { requesterID, friendID, invitationId } = req.body;
        await FriendDB.insertFriendData(requesterID, friendID, invitationId);
        return res.status(200).json({ status: "success", message: "成功加入好友"});

    } catch (err) {
        res.status(500).send({ status: "error", message: "內部伺服器出現錯誤" });
    }
});



module.exports = { router};