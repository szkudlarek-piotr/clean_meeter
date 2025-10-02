import dotenv from 'dotenv'
import mysql from 'mysql2'
dotenv.config()

const pool = mysql.createPool({
    host     : process.env.host,
    user     : process.env.MYSQL_USER,
    database : process.env.MYSQL_DATABASE
}).promise()

export default async function getQuoteForGuessingWithExcludedQuoteIds(excludedQuoteIdsString, excludedPeopleIdsString) {
    const getQuoteQueryString = `
    SELECT golden_quotes.quote_id, golden_quotes.quote
    FROM golden_quotes
    JOIN party_people ON golden_quotes.human_id = party_people.ID
    WHERE golden_quotes.quote_id NOT IN (?) AND golden_quotes.is_public = 1
    AND party_people.ID NOT IN (?)
    AND party_people.klika_id NOT IN (15, 16)
    ORDER BY RAND()
    LIMIT 1;
    `
    const [getQuoteQuery] = await pool.query(getQuoteQueryString, [excludedQuoteIdsString.split(","), excludedPeopleIdsString.split(",")])
    return getQuoteQuery[0]
}
