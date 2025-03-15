import mysql from 'mysql2'
import dotenv from 'dotenv'
dotenv.config()
const pool = mysql.createPool({
    host     : process.env.host,
    user     : process.env.MYSQL_USER,
    database : process.env.MYSQL_DATABASE
}).promise()

export default async function addQuote(authorId, quote, isPublic) {
    const queryText = "INSERT INTO `golden_quotes` (`quote_id`, `human_id`, `quote`, `is_public`) VALUES (NULL, ?, ?, ?);"
    const [addQuoteQuery] = await pool.query(queryText, [authorId, quote, isPublic])
    return addQuoteQuery
}