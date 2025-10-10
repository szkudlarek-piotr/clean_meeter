import dotenv from 'dotenv'
import mysql from 'mysql2'
dotenv.config()
const pool = mysql.createPool({
    host     : process.env.host,
    user     : process.env.MYSQL_USER,
    database : process.env.MYSQL_DATABASE
}).promise()
export default async function addQuoteGuessInstnce(quoteId, playerId, postulatedAuthorId) {
    const quoteIdReqString = `SELECT human_id FROM golden_quotes WHERE quote_id = ?`;
    const [quoteIdReq] = await pool.query(quoteIdReqString, [quoteId]);

    let insertReq;
    let addGuessInstanceReq; // ← tutaj deklaracja

    if (quoteIdReq.length > 0) {
        const realAuthorId = quoteIdReq[0]["human_id"];
        console.log(playerId)
        if (playerId) {
            console.log(`powinienem wstawić z numerki ${playerId}`)
            addGuessInstanceReq = `INSERT INTO quote_guesses (id, quote_id, player_id, postulated_author_id, author_id)
                                   VALUES (NULL, ?, ?, ?, ?);`;
            [insertReq] = await pool.query(addGuessInstanceReq, [quoteId, playerId, postulatedAuthorId, realAuthorId]);
        } else {
            addGuessInstanceReq = `INSERT INTO quote_guesses (id, quote_id, postulated_author_id, author_id)
                                   VALUES (NULL, ?, ?, ?);`;
            [insertReq] = await pool.query(addGuessInstanceReq, [quoteId, postulatedAuthorId, realAuthorId]);
        }
        return insertReq;
    }
}

