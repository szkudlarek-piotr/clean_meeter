import mysql from 'mysql2'
import dotenv from 'dotenv'
dotenv.config()
const pool = mysql.createPool({
    host     : process.env.host,
    user     : process.env.MYSQL_USER,
    database : process.env.MYSQL_DATABASE
}).promise()

export default async function addMeeting(date, place, shortDesc, longDesc) {
    const queryText = "INSERT INTO `meetings` (`ID`, `meeting_date`, `Place`, `short_description`, `long_desc`) VALUES (NULL, ?, ?, ?, ?);"
    const [addQuoteQuery] = await pool.query(queryText, [date, place, shortDesc, longDesc])
    return addQuoteQuery
}