const router = require('express').Router();
const bodyParser = require('body-parser');

const jwt = require('jsonwebtoken');

const { S3 } = require("@aws-sdk/client-s3");

const multer = require('multer');
const uuid = require('uuid');

let UserInfoDB= require("../models/userInfoDB").UserInfoDB;

const dotenv = require("dotenv");
dotenv.config()

UserInfoDB= new UserInfoDB();

const secretKey = process.env.jwt_secrect_key;
router.use(bodyParser.json());

const s3 = new S3({ 
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "us-west-1" 
});

router.get('/getMemberData', async(req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, secretKey);
    data = await UserInfoDB.getUserInfo(decodedToken.userId);
    if (data && data.length > 0) {
        res.status(200).send(data[0]);
    } else {
        res.status(404).json({ message: "未找到用戶資料" });
    }
});


// 處理文件上傳
const upload = multer({
    // 使用記憶體儲存，檔案將保存在 RAM 中
    storage: multer.memoryStorage(), 
    fileFilter: function (req,file, cb) {
      // 驗證檔案類型，只接受 jpg 和 png 格式
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only jpg and png formats are allowed!'), false);
    }
    cb(null, true);
    },
});

//修改會員資料
router.post('/uploadUserInfo', upload.single('file'), async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, secretKey);
        let userId = decodedToken.userId;
        let cloudFrontUrl;
        let updateParams = { userId: userId };
        

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

            updateParams.headShot=cloudFrontUrl;
        }

        if ('myNickName' in req.body) {
            updateParams.nickName = req.body.myNickName;
        }
        if ('myMoodText' in req.body) {
            updateParams.moodText = req.body.myMoodText;
        }
        await UserInfoDB.updateUserInfo(updateParams);

        return res.status(200).json({ 
            message: "更新成功",
            updateParams: updateParams
        });
    }catch (err) {
        console.error("更新失敗", err);
        return res.status(500).json({ message: "更新失敗" });
    }
});

module.exports = { router };