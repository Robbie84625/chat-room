const pool = require("../database_connect").pool;
const dotenv = require("dotenv");
dotenv.config();

let result,values;
class ChatDB {
    async insertPersonalMessage(requesterID,recipientID,message,contentType){
        let mysqlQuery = "INSERT INTO `personal_messages`(requesterID, recipientID, content,contentType) VALUES(?, ?, ?, ?);";
        let values = [requesterID, recipientID, message,contentType];
        await pool.query(mysqlQuery, values);
    }

    async chatRoomHistoryMsg(requesterID,recipientID,page,timezone){
        let queryMySQL = `
        SELECT 
            m1.nickName AS requesterNickName, 
            m2.nickName AS recipientNickName, 
            msg.content, CONVERT_TZ(msg.dateTime, '+00:00', ?) AS dateTime , msg.readStatus , msg.contentType 
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

    async insertGroupMessage(guildID,userId,message,groupMember,contentType){
        const insertQueryMySQL = `
            INSERT INTO guild_messages(guildID, senderID,content,contentType) VALUES(?, ?, ?, ?);
        `;

        const batchInsertQuery = `
            INSERT INTO guild_messagesReadStatus(messageID, memberID, isRead,guildID) VALUES ?;
        `;
        let values = [guildID,userId,message,contentType];
        try {
            const queryResults = await pool.query(insertQueryMySQL, values);
            const messageID = queryResults[0].insertId;
            const groupMembers = groupMember.map(memberID => [messageID, memberID, 0,guildID]);
            await pool.query(batchInsertQuery, [groupMembers]);

        } catch (error) {
            console.log(error.message);
        }
    }

    async updateGroupReadStatus(guildID,userID){
        let queryMySQL = `
        UPDATE guild_messagesReadStatus
            SET isRead = 1
        WHERE 
            guildID = ? AND memberID = ? AND isRead = 0 
        ORDER BY messageID DESC
            LIMIT 100;
    `;
    let values = [guildID,userID];
    await pool.query(queryMySQL, values);
    }
    
    async groupHistoryMsg(guildID,page,timezone){
        let queryMySQL = `
        SELECT 
            m.nickName AS senderNickName, 
            g.content,g.contentType,
            CONVERT_TZ(g.timestamp, '+00:00', ?) AS timestamp
        FROM 
            guild_messages g
        INNER JOIN 
            member m ON g.senderID = m.memberId
        WHERE 
            g.guildID = ?
        ORDER BY 
            timestamp DESC
        LIMIT ?, ?;
        `;
        let values = [timezone,guildID,page*10,11];
        try {
            let queryResults = await pool.query(queryMySQL, values);
            result = queryResults[0];
        } catch (error) {
            console.log(error.message);
        }
        return result;
    }

    async findAllMessage(userId,page){
        const queryMySQL = `
        SELECT * FROM (
            -- 个人消息部分
            SELECT 
                CASE 
                    WHEN nm.requesterID = ? THEN m2.nickName 
                    ELSE m1.nickName 
                END AS name,
                CASE 
                    WHEN nm.requesterID = 1 THEN m1.nickName
                    ELSE m2.nickName 
                END AS otherNickName,
                CASE 
                    WHEN nm.requesterID = ? THEN m2.headshot 
                    ELSE m1.headshot 
                END AS avatar,
                nm.messageID,
                nm.requesterID,
                nm.recipientID,
                nm.content,
                nm.contentType,
                nm.dateTime AS dateTime,
                nm.readStatus,
                CASE 
                    WHEN nm.requesterID = ? THEN ? 
                    ELSE 0 
                END AS isMe,
                0 AS isGroup,  -- 个人消息标记为 0
                m1.onlineStatus,  -- 来自member表
                m1.moodText,      -- 来自member表
                m1.email,
                NULL AS senderNickName  -- 个人消息没有senderNickName
            FROM (
                SELECT
                    messageID, requesterID, recipientID, content, contentType, dateTime, readStatus,
                    ROW_NUMBER() OVER (PARTITION BY
                        CASE
                            WHEN requesterID = ? THEN recipientID
                            WHEN recipientID = ? THEN requesterID
                        END
                    ORDER BY dateTime DESC) AS rn
                FROM personal_messages
                WHERE requesterID = ? OR recipientID = ?
            ) AS nm
            LEFT JOIN member AS m1 ON nm.requesterID = m1.memberID
            LEFT JOIN member AS m2 ON nm.recipientID = m2.memberID
            WHERE nm.rn = ?
        
            UNION ALL
        
            -- 群组消息部分
            SELECT 
                g.guildName AS name,
                NULL AS otherNickName,
                g.guildAvatar AS avatar,
                gm.messageID,
                gm.senderID AS memberID,
                gm.guildID AS recipientID,
                gm.content,
                gm.contentType,
                gm.timestamp AS dateTime,
                gmrs.isRead AS readStatus,
                CASE 
                    WHEN gm.senderID = ? THEN ? 
                    ELSE 0 
                END AS isMe,
                1 AS isGroup,  -- 群组消息标记为 1
                NULL AS onlineStatus,  -- 群组消息没有 onlineStatus
                NULL AS moodText,      -- 群组消息没有 moodText
                NULL AS email,
                m.nickName AS senderNickName  -- 群组消息中senderId对应的nickName
            FROM 
                guild_messages gm
            JOIN 
                guild_messagesReadStatus gmrs ON gm.messageID = gmrs.messageID
            JOIN 
                guild g ON gm.guildID = g.guildID
            JOIN 
                member m ON gm.senderID = m.memberID  -- 与member表连接以获取nickName
            WHERE 
                gmrs.memberID = ?
            AND 
                gm.timestamp = (
                    SELECT MAX(gm2.timestamp)
                    FROM guild_messages gm2
                    WHERE gm2.guildID = gm.guildID
                    AND gm2.messageID IN (
                        SELECT messageID
                        FROM guild_messagesReadStatus
                        WHERE memberID = ?
                    )
                )
        ) AS combined_results
        ORDER BY dateTime DESC
        LIMIT ?, ?;
        `;
        values = [userId,userId,userId,userId,userId,userId,userId,userId,userId,userId,userId,userId,userId,page*10,11];
        try {
            const queryResults = await pool.query(queryMySQL, values);
            result = queryResults[0]
        } catch (error) {
            console.log(error.message);
        }
        return result;
    }


}

module.exports = {
    ChatDB
};