import dotenv from 'dotenv'
import mysql from 'mysql2'
dotenv.config()
const pool = mysql.createPool({
    host     : process.env.host,
    user     : process.env.MYSQL_USER,
    database : process.env.MYSQL_DATABASE
}).promise()

export default async function getSuggestedPlaceCategories(inputString) {
    const queryText = `SELECT DISTINCT places.category FROM places WHERE places.category LIKE ?;`
    const [queryReq] = await pool.query(queryText, `%${inputString}%`)
    return queryReq
}
