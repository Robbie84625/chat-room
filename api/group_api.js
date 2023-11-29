const router = require('express').Router();
const bodyParser = require('body-parser');

const jwt = require('jsonwebtoken');

const { S3 } = require("@aws-sdk/client-s3");

const multer = require('multer');
const uuid = require('uuid');

let GroupDB= require("../models/groupDB").GroupDB;
let UserInfoDB= require("../models/userInfoDB").UserInfoDB;

const dotenv = require("dotenv");
dotenv.config()

GroupDB= new GroupDB();
UserInfoDB= new UserInfoDB();

const secretKey = process.env.jwt_secrect_key;
router.use(bodyParser.json());

const s3 = new S3({ 
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "us-west-1" 
});

const upload = multer({
    storage: multer.memoryStorage(), 
    fileFilter: function (req,file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only jpg and png formats are allowed!'), false);
    }
    cb(null, true);
    },
});

router.post('/uploadGroupInfo', upload.single('file'), async (req, res) => {
    try {
        let cloudFrontUrl;
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

            updateParams.headShot=cloudFrontUrl;
        }
        updateParams.groupName = req.body.groupName;
            
        result= await GroupDB.createGroup(updateParams);

        return res.status(200).json({ message: "更新成功",groupId:result});
    }catch (err) {
        return res.status(500).json({ message: "更新失敗"});
    }
});

router.post('/uploadMember', async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, secretKey);
        let userId = decodedToken.userId;

        const groupMembers = req.body.groupMember;
        const groupId=req.body.groupId;

        let dataToInsert = [];
        if (!groupMembers || groupMembers.length === 0) {
            dataToInsert.push([groupId, userId, 1, null]);
        }
        else {
            dataToInsert.push([groupId, userId, 1, null]);
            groupMembers.forEach(memberId => {
                dataToInsert.push([groupId, memberId, 0, userId]);
            });
        }
        await GroupDB.insertMemberToGroup(dataToInsert);
        res.status(200).json({ message: "更新成功" });
    }catch (err) {
        return res.status(500).json({ message: "更新失敗"});
    }
});

router.get('/getGroupData', async (req, res) => {
    const page = req.query.page || 0;
    const keyword = req.query.keyword;
    const pageNumber = parseInt(page, 10);

    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, secretKey);
    let nextPage=0;
    const userData=await UserInfoDB.getUserInfo(decodedToken.userId);
    if(!keyword){
        const groupData = await GroupDB.findGroup(decodedToken.userId,pageNumber);
        if (groupData.length < 11) {
            nextPage = null;
        } else {
            nextPage=pageNumber+1;
        }
        let groupDataResult = {
            "userInfo":{userNickName:userData[0].nickName,userId:userData[0].memberId},
            "nextPage": nextPage,
            "data": groupData.slice(0, 10)
        };
        res.send(JSON.stringify(groupDataResult));
    }
    if (keyword){
        const groupData = await GroupDB.findGroup_By_KeyWord(decodedToken.userId,keyword,pageNumber);
        if (groupData.length < 11) {
            nextPage = null;
        } else {
            nextPage=pageNumber+1;
        }
        let groupDataResult = {
            "userInfo":{userNickName:userData[0].nickName,userId:userData[0].memberId},
            "nextPage": nextPage,
            "data": groupData.slice(0, 10)
        };
        res.send(JSON.stringify(groupDataResult));
    }
    
});

router.post('/getGroupMember', async (req, res) => {
    const groupMemberData=await GroupDB.getGroupMember(req.body.guildID);
    res.send(JSON.stringify({groupMemberData:groupMemberData}));
});

module.exports = { router };