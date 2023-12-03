const router = require('express').Router();

const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const { S3 } = require("@aws-sdk/client-s3");

const multer = require('multer');
const uuid = require('uuid');

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

const s3 = new S3({ 
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "us-west-1" 
});
const maxFileSize = 100 * 1024 * 1024; 

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: maxFileSize,
    },
    fileFilter: function (req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|mp4)$/i)) {
            return cb(new Error('Only jpg, jpeg, png, gif, and mp4 formats are allowed!'), false);
        }
        cb(null, true);
    },
});
router.post('/uploadToFriend', upload.single('file'), async (req, res) => {
    try {
        let cloudFrontUrl;
        let fileType=req.file.mimetype
        let updateParams = {};

        if (req.file) {
            const fileName = uuid.v4();
            const params = {
                Bucket: process.env.S3_Headshot_Bucket,
                Key: fileName,
                Body: req.file.buffer
            };

            await s3.putObject(params);
            const cloudFrontDomain = process.env.cloudFrontDomain;
            cloudFrontUrl = `${cloudFrontDomain}/${fileName}`;

            updateParams.url=cloudFrontUrl;
        }
        updateParams.fileType=fileType;

        return res.status(200).json({ message: "更新成功",updateParams});
    }catch (err) {
        console.error("更新失敗", err);
        return res.status(500).json({ message: "更新失敗" });
    }
});


module.exports = { router};