const pool = require("../database_connect").pool;
let queryMySQL, value, result;

class FriendDB {

    async selectNewFriend(email) {
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
}


module.exports = {
    FriendDB
};