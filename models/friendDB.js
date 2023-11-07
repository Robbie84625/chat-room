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
        queryMySQL = 'SELECT * FROM Friendship WHERE requesterID = ? AND friendID = ?;';
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
}


module.exports = {
    FriendDB
};