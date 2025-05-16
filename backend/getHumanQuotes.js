import dotenv from 'dotenv'
import mysql from 'mysql2'
dotenv.config()
const pool = mysql.createPool({
    host     : process.env.host,
    user     : process.env.MYSQL_USER,
    database : process.env.MYSQL_DATABASE
}).promise()

export default async function getHumanQuotes(humanId) {
    const quotesQuoeryText = `
    SELECT quote
    FROM golden_quotes
    WHERE is_public = 1
    AND human_id = ?
    `
    const [quotesQuery] = await pool.query(quotesQuoeryText, [humanId])
    return quotesQuery
}