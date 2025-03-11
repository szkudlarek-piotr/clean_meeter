const mysql = require('mysql2')
var dotenv = require('dotenv');
dotenv.config()
const pool = mysql.createPool({
    host     : process.env.host,
    user     : process.env.MYSQL_USER,
    database : process.env.MYSQL_DATABASE
}).promise()

async function addQuote(authorId, quote, public) {
    const requestTemplate = "INSERT INTO `golden_quotes` (`quote_id`, `human_id`, `quote`, `is_public`) VALUES (NULL, ?, ?, ?)"
    const postQuoteRequest = pool.query(requestTemplate, [authorId, quote, public])
}
module.exports = addQuote
