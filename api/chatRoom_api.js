const router = require('express').Router();
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
dotenv.config();

const secretKey = process.env.jwt_secrect_key;

// 定義JWT驗證中間件
function authenticateToken(req, res, next) {
    const token = req.header('Authorization');

    if (!token) return res.status(401).send('未提供令牌');

    jwt.verify(token.replace('Bearer ', ''), secretKey, (err, userData) => {
    if (err) return res.status(403).send('令牌無效');
    req.userData=userData;

    next();
    });
}

// 使用中間件來保護特定路由
router.use(authenticateToken);


router.get('/getMemberData', (req, res) => {
    const userData = req.userData;

    res.send(JSON.stringify(userData));
});


module.exports = {router};