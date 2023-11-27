const pool = require("../database_connect").pool;
let queryMySQL, value, values,result,results;

class FriendDB {

    async findNewFriend(email) {
        queryMySQL = 'SELECT memberId,email,name,nickName,headshot,moodText FROM member WHERE email = ?;';
        value = [email];
        try {
            const queryResults = await pool.query(queryMySQL, value);
            result = queryResults[0]
        } catch (error) {
            console.log(error.message);
        }
        return result;
    }
    async checkFriendship(requesterID,  friendID) { 
        queryMySQL = 'SELECT count(*) FROM friend_ship WHERE (requesterID = ? AND friendID = ?) OR (requesterID = ? AND friendID = ?);';
        values = [requesterID, friendID, friendID, requesterID];
        try {
            const queryResults = await pool.query(queryMySQL, values);
            if (queryResults[0][0]['count(*)'] > 0) {
                result = true;
            } else {
                result = false;
            }
        } catch (error) {
            result = false;
        }
        return result;
    }

    async createFriendInvitation(requesterID,  friendID ,invitationStatus) {
        const queryMySQL = 'INSERT INTO friend_invitations(`requesterID`, `friendID`, `invitationStatus`) VALUES(?,?,?);';
        const values = [requesterID,  friendID ,invitationStatus];
            
        try {
            await pool.query(queryMySQL, values);
            
        }catch (error) {
            console.error("error:", error.message);
        }
    }

    

    async checkFriendInvitation(requesterID,  friendID, invitationStatus) {
        
        let result = true;
        const queryMySQL = `SELECT * FROM friend_invitations WHERE ((requesterID = ? AND friendID = ?) OR (requesterID = ? AND friendID = ?)) AND invitationStatus = 'PendingConfirmation';`;
        const values = [requesterID, friendID, friendID, requesterID, invitationStatus];
        try {
            const queryResults = await pool.query(queryMySQL, values);
            if (queryResults[0].length > 0) {
                result = false;
            }
        } catch (error) {
            console.error("error:", error.message);
            result = false;
        }
        return result;
    }

    async findFriendshipStatus(userId,page){
        const queryMySQL = `
        SELECT 
            fi.*, 
            m1.name AS friendName, m1.nickname AS friendNickname, m1.headShot AS friendHeadShot, 
            m2.name AS requesterName, m2.nickname AS requesterNickname, m2.headShot AS requesterHeadShot
        FROM 
            friend_invitations AS fi
            LEFT JOIN member AS m1 ON fi.friendId = m1.memberId
            LEFT JOIN member AS m2 ON fi.requesterID = m2.memberId
            WHERE fi.friendID = ? OR fi.requesterID = ?
            ORDER BY fi.createdTime DESC LIMIT ?, ?;
        `;
        values = [userId, userId ,page*10,11];
        try {
            const queryResults = await pool.query(queryMySQL, values);
            results = queryResults[0];
        } catch (error) {
            console.log(error.message);
        }
        return results;
    }

    async insertFriendData(requesterID, friendID,invitationId ) {
        try {
            const insertQueryMySQL = `
                INSERT INTO friend_ship(requesterID, friendID) VALUES(?, ?);
            `;
            const updateQueryMySQL = `
                UPDATE friend_invitations 
                SET invitationStatus = 'Confirmed', createdTime = NOW() 
                WHERE id = ?;
            `;
            await pool.query(insertQueryMySQL, [requesterID, friendID]);
            await pool.query(insertQueryMySQL, [friendID, requesterID]);
            await pool.query(updateQueryMySQL, [invitationId]);
        } catch (error) {
            console.error("error:", error.message);
        }
    }

    async findFriendship(userId,page){
        const queryMySQL = `
            SELECT 
                f.friendshipID, f.createdTime,f.requesterID,f.friendId,
                requester.nickName AS requesterNickName,
                friend.nickName AS friendNickName,friend.headshot,friend.moodText,friend.email,friend.onlineStatus
            FROM  
                friend_ship AS f
            JOIN 
                member AS requester ON f.requesterID = requester.memberID
            JOIN 
                member AS friend ON f.friendID = friend.memberID
            WHERE
                f.requesterID = ?
            ORDER BY 
                f.createdTime DESC
            LIMIT ?, ?;
        `;
        values = [userId,page*10,11];
        try {
            const queryResults = await pool.query(queryMySQL, values);
            result = queryResults[0]
        } catch (error) {
            console.log(error.message);
        }
        return result;
    }

    async findFriendship_By_KeyWord(userId,keyword,page){
        const queryMySQL = `
            SELECT 
                f.friendshipID, f.createdTime,f.requesterID,f.friendId,
                requester.nickName AS requesterNickName,
                friend.nickName AS friendNickName,friend.headshot,friend.moodText,friend.email,friend.onlineStatus
            FROM 
                friend_ship AS f
            JOIN 
                member AS requester ON f.requesterID = requester.memberID
            JOIN 
                member AS friend ON f.friendID = friend.memberID
            WHERE 
                f.requesterID = ? AND friend.nickName LIKE CONCAT('%', ?, '%')
            ORDER BY 
                f.createdTime DESC
            LIMIT ?, ?;
        `;
        values = [userId,keyword,page*10,11];
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
    FriendDB
};

