const pool = require("../database_connect").pool;
let queryMySQL, value;

class NoticeDB {
    async deleteInvite(invitationId) {
        queryMySQL = 'DELETE FROM friend_invitations WHERE id = ?;';
        value = [invitationId];
        try {
            await pool.query(queryMySQL, value);
            return '刪除成功';
            
        } catch (error) {
            return '刪除失敗';
        }
    }
}

module.exports = {
    NoticeDB
};