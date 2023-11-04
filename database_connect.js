const mysql = require('mysql2');
const dotenv = require("dotenv");
dotenv.config();

const pool = mysql.createPool({
    host: process.env.Db_host,
    user: process.env.Db_user,
    password: process.env.Db_password,
    database: process.env.Database,
    waitForConnections: true,
    connectionLimit: 50,
    queueLimit: 0
}).promise();


module.exports = {
    pool
};
