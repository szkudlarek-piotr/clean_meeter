import dotenv from 'dotenv'
import mysql from 'mysql2'
dotenv.config()
const pool = mysql.createPool({
    host     : process.env.host,
    user     : process.env.MYSQL_USER,
    database : process.env.MYSQL_DATABASE
}).promise()
export default async function addVisitGuest(visitId, guestId) {
    const queryText = "INSERT INTO `visit_guest` (`visit_id`, `guest_id`) VALUES (?, ?);"
    const [insertReq] = await pool.query(queryText, [visitId, guestId])
    return insertReq
}