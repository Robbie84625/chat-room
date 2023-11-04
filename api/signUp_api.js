const router = require('express').Router();

const bodyParser = require('body-parser');
let SignUpDB = require("../models/signUpDB").SignUpDB;

router.use(bodyParser.json());

SignUpDB = new SignUpDB();


router.post("/signUp", async (req, res) => {
    const { email, password, name, nickName } = req.body;

    if (!email || !password || !name || !nickName) {
        return res.status(400).send({ status: "error", message: "註冊資料不可為空" });
    }

    try {
        const isEmailAvailable = await checkEmailAvailability(email);

        if (!isEmailAvailable) {
            return res.status(400).send({ status: "error", message: "email已被註冊過了" });
        }

        await insertSignupData(email, password, name, nickName);
        res.status(200).send({ status: "success", message: "註冊成功" });

    } catch (err) {
        res.status(500).send({ status: "error", message: "內部伺服器出現錯誤" });
    }
});

async function checkEmailAvailability(email) {
    const isEmailVerified = await SignUpDB.checkEmail(email);
    return isEmailVerified;
}

async function insertSignupData(email, password, name, nickName) {
    try {
        await SignUpDB.insertSignupData(email, password, name, nickName);
    } catch (error) {
        throw new Error("Error while inserting data into the database");
    }
}

module.exports = { router };