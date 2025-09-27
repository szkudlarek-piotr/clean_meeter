import dotenv from 'dotenv'
import mysql from 'mysql2'
dotenv.config()

const pool = mysql.createPool({
    host     : process.env.host,
    user     : process.env.MYSQL_USER,
    database : process.env.MYSQL_DATABASE
}).promise()

export default async function getQuoteForGuessingWithExcludedQuoteIds(excludedQuoteIdsString) {
    const getQuoteQueryString = `
    SELECT golden_quotes.quote_id, golden_quotes.quote
    FROM golden_quotes
    WHERE golden_quotes.quote_id NOT IN (?) AND golden_quotes.is_public = 1
    ORDER BY RAND()
    LIMIT 1;
    `
    const [getQuoteQuery] = await pool.query(getQuoteQueryString, excludedQuoteIdsString)
    return getQuoteQuery[0]
}
