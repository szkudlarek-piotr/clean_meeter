import dotenv from 'dotenv'
import mysql from 'mysql2'
dotenv.config()
const pool = mysql.createPool({
    host     : process.env.host,
    user     : process.env.MYSQL_USER,
    database : process.env.MYSQL_DATABASE
}).promise()
export default async function addMettingHuman(meetingId, humanId) {
    const queryText = "INSERT INTO `meeting_human` (`meeting_id`, `human_id`) VALUES (?, ?);"
    const [insertReq] = await pool.query(queryText, [meetingId, humanId])
    return insertReq
}