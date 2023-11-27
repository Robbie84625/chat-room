const pool = require("../database_connect").pool;
const dotenv = require("dotenv");
dotenv.config();

let result;
class ChatDB {
    async insertPersonalMessage(requesterID,recipientID,message){
        let mysqlQuery = "INSERT INTO `personal_messages`(requesterID, recipientID, content) VALUES(?, ?, ?);";
        let values = [requesterID, recipientID, message];
        await pool.query(mysqlQuery, values);
    }

    async chatRoomHistoryMsg(requesterID,recipientID,page,timezone){
        let queryMySQL = `
        SELECT 
            m1.nickName AS requesterNickName, 
            m2.nickName AS recipientNickName, 
            msg.content, CONVERT_TZ(msg.dateTime, '+00:00', ?) AS dateTime , msg.readStatus 
        FROM 
            personal_messages AS msg
        JOIN 
            member AS m1 ON msg.requesterID = m1.memberID
        JOIN 
            member AS m2 ON msg.recipientID = m2.memberID
        WHERE 
            (msg.requesterID = ? AND msg.recipientID = ?) OR 
            (msg.requesterID = ? AND msg.recipientID = ?)
        ORDER BY 
            dateTime DESC
        LIMIT ?, ?;
        `;
        let values = [timezone,requesterID, recipientID, recipientID, requesterID,page*10,11];
        try {
            let queryResults = await pool.query(queryMySQL, values);
            result = queryResults[0]
        } catch (error) {
            console.log(error.message);
        }
        return result;
    }
    
    async updateReadStatus(requesterID,recipientID){
        let queryMySQL = `
            UPDATE personal_messages
                SET readStatus = 1
            WHERE 
                requesterID = ? AND recipientID = ? AND readStatus = 0 
            ORDER BY dateTime DESC
                LIMIT 100;
        `;
        let values = [recipientID, requesterID];
        await pool.query(queryMySQL, values);
    }
}

module.exports = {
    ChatDB
};