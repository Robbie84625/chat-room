const pool = require("../database_connect").pool;
let values,value,result;

class GroupDB {

    async createGroup(updateParams) {
        try {
            const queryMySQL = 'INSERT INTO guild(`guildName`, `guildAvatar`) VALUES(?,?);';
            const values = [updateParams.groupName,updateParams.headShot];
            const result=await pool.query(queryMySQL, values);
            const insertedId = result[0].insertId;
            return insertedId;
        } catch (error) {
            console.error("error:", error.message);
        }
    }
    
    async insertMemberToGroup(data) {
        try {
            const query = 'INSERT INTO guild_member(guildID, memberID, isAdmin, invitedBy) VALUES ?';
            await pool.query(query, [data]);
        } catch (error) {
            console.error("error:", error.message);
        }
    }

    async findGroup(userId,page){
        const queryMySQL = `
        SELECT 
            G.guildID, G.guildName, G.guildAvatar
        FROM  
            guild AS G
        INNER JOIN 
            guild_member AS GM ON G.guildID = GM.guildID
        WHERE 
            GM.memberID = ?
        ORDER BY 
            GM.joinDate DESC
        LIMIT ?, ?;
        `;
        let values = [userId,page*10,11];
        try {
            const queryResults = await pool.query(queryMySQL, values);
            result = queryResults[0]
        } catch (error) {
            console.log(error.message);
        }
        return result;
    }

    async findGroup_By_KeyWord(userId,keyword,page){
        const queryMySQL = `
        SELECT 
            G.guildID, G.guildName, G.guildAvatar
        FROM  
            guild G
        INNER JOIN 
            guild_member GM ON G.guildID = GM.guildID AND G.guildName LIKE CONCAT('%', ?, '%')
        WHERE 
            GM.memberID = ?
        ORDER BY 
            GM.joinDate DESC
        LIMIT ?, ?;
        `;
        values = [keyword,userId,page*10,11];
        try {
            const queryResults = await pool.query(queryMySQL, values);
            result = queryResults[0]
        } catch (error) {
            console.log(error.message);
        }
        return result;
    }
    async getGroupMember(guildID){
        const queryMySQL = `
            SELECT guild_member.memberID,guild_member.isAdmin
            FROM guild_member
            WHERE guild_member.guildID = ?;
        `;
        value = [guildID];
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
    GroupDB
};
