const pool = require("../database_connect").pool;


let queryMySQL, values, result;

class SignUpDB {

    async insertSignupData(email, password, name, nickname) {
        try {
            const queryMySQL = 'INSERT INTO member(`email`, `password`, `name`, `nickname`) VALUES(?,?,?,?);';
            const values = [email, password, name, nickname];
            await pool.query(queryMySQL, values);
        } catch (error) {
            console.error("error:", error.message);
        }
    }

    async checkEmail(email) {
        queryMySQL = 'SELECT * FROM member WHERE email = ?;';
        values = [email];
        try {
            const queryResults = await pool.query(queryMySQL, values);
            if (queryResults[0].length === 0) {
                result = true;
            } else {
                result = false;
            }
        } catch (error) {
            console.log(error.message);
            result = false;
        }
        return result;
    }
}


module.exports = {
    SignUpDB
};
