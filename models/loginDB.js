const pool = require("../database_connect").pool;
let queryMySQL, values, result;

class LoginDB {

    async checkMember(email, password) {
        queryMySQL = 'SELECT * FROM member WHERE email = ? AND password = ?;';
        values = [email, password];
        try {
            const queryResults = await pool.query(queryMySQL, values);
            if (queryResults[0].length === 1) {
                result = true;
            } else {
                result = false;
            }
        } catch (error) {
            result = false;
        }
        return result;
    }

    async getMemberData(email, password) {
        queryMySQL = 'SELECT * FROM member WHERE email = ? AND password = ?;';
        values = [email, password];
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
    LoginDB
};