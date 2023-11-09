const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
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

// 新的路由定義，使用router.get
router.get('/getMemberData', (req, res) => {
    const userData = req.userData;

    res.send(JSON.stringify(userData));
});

// 添加其他路由定义
// 请确保在这里添加您的其他API端点路由

module.exports = {router};