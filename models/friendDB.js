const pool = require("../database_connect").pool;
let queryMySQL, value, values,result;

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
        queryMySQL = 'SELECT * FROM friend_ship WHERE requesterID = ? AND friendID = ?;';
        values = [requesterID, friendID];
        try {
            const queryResults = await pool.query(queryMySQL, values);
            if (queryResults[0].count > 0) {
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
        const queryMySQL = 'SELECT * FROM friend_invitations WHERE requesterID = ? AND friendID = ? AND invitationStatus = ?;';
        const values = [requesterID, friendID , invitationStatus];
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
}


module.exports = {
    FriendDB
};