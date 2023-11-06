const router = require('express').Router();

const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');


let FriendDB = require("../models/friendDB").FriendDB;

router.use(bodyParser.json());
FriendDB = new FriendDB();



router.post("/selectNewFriend", async (req, res) => {
    try {

        const newFriendData = await FriendDB.selectNewFriend(req.body.email);
        if (!newFriendData) {
            return res.status(400).send({ status: "error", message: "無此用戶" });
        }

        

        else if (newFriendData) {
            res.status(200).send({ status: "success", message: "搜尋成功", newFriendData: newFriendData });
        } else {
            res.status(401).send({ status: "error", message: "搜尋失败" });
        }

    } catch (err) {
        res.status(500).send({ status: "error", message: "內部伺服器出現錯誤" });
    }

});

module.exports = { router};