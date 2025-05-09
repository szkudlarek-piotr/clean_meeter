import mysql from 'mysql2'
import dotenv from 'dotenv'
dotenv.config()
const pool = mysql.createPool({
    host     : process.env.host,
    user     : process.env.MYSQL_USER,
    database : process.env.MYSQL_DATABASE
}).promise()

export default async function addVisit(date, duration, shortDesc, longDesc) {
    const queryText = "INSERT INTO `visits` (`visit_id`, `visit_date`, `visit_duration`, `short_description`, `description`) VALUES (NULL, ?, ?, ?, ?);"
    const [addQuoteQuery] = await pool.query(queryText, [date, duration, shortDesc, longDesc])
    return addQuoteQuery
}