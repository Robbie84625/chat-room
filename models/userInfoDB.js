const pool = require("../database_connect").pool;
let queryMySQL, value, result;

class UserInfoDB {

    async updateUserInfo(updateParams) {
        try {
            let updates = [];
            let values = [];

            if (updateParams.headShot) {
                updates.push('headshot = ?');
                values.push(updateParams.headShot);
            }
            if(updateParams.nickName){
                updates.push('nickName = ?');
                values.push(updateParams.nickName);
            }
            if(updateParams.moodText){
                updates.push('moodText = ?');
                values.push(updateParams.moodText);
            }

            if (updates.length === 0) return;

            const queryMySQL = `UPDATE member SET ${updates.join(', ')} WHERE memberId = ?`;
            values.push(updateParams.userId);

            await pool.query(queryMySQL, values);
        } catch (error) {
            console.error("error:", error.message);
        }
    }

    async getUserInfo(userId) {
        let value = [userId];
        queryMySQL = 'SELECT * FROM member WHERE memberId = ?;';
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
    UserInfoDB
};
