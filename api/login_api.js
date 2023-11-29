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
            await LoginDB.updateToOnline(userData.userId);
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
    return {userId: data[0].memberId,email: data[0].email,name: data[0].name};
}

router.post('/signOut', async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    try {
        const decodedToken = jwt.verify(token, secretKey);
        await LoginDB.updateToOffline(decodedToken.userId);
        res.status(200).json({ message: '登出成功' ,"userId":decodedToken.userId});
    } catch (error) {
        res.status(500).json({ message: '伺服器錯誤' });
    }
});
module.exports = { router , getUserData};