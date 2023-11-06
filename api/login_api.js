const router = require('express').Router();

const jwt = require('jsonwebtoken');

const bodyParser = require('body-parser');
let LoginDB = require("../models/loginDB").LoginDB;

const dotenv = require("dotenv");
dotenv.config()


const secretKey = process.env.jwt_secrect_key;

router.use(bodyParser.json());
LoginDB = new LoginDB();

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).send({ status: "error", message: "不可為空" });
        }

        const isMember = await LoginDB.checkMember(email, password);
        if (!isMember) {
            return res.status(400).send({ status: "error", message: "無此用戶" });
        }

        const userData = await getUserData(email, password);

        if (userData) {
            const token = jwt.sign(userData, secretKey, { expiresIn: '24h' });
            res.status(200).send({ status: "success", message: "登入成功", token: token  });
        } else {
            res.status(401).send({ status: "error", message: "登入失败" });
        }

    } catch (err) {
        res.status(500).send({ status: "error", message: "內部伺服器出現錯誤" });
    }
});

async function getUserData(email, password) {
    const data = await LoginDB.getMemberData(email, password);
    return {userId: data[0].memberId,email: data[0].email,nickName: data[0].nickName,name: data[0].name,headshot:data[0].headshot,moodText:data[0].moodText};
}


module.exports = { router , getUserData};