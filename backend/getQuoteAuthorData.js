import dotenv from 'dotenv'
import mysql from 'mysql2'
import getHumanPhotoDir from './getPhotoFromHumanId.js'

dotenv.config()
const pool = mysql.createPool({
    host     : process.env.host,
    user     : process.env.MYSQL_USER,
    database : process.env.MYSQL_DATABASE
}).promise()
export default async function getQuoteAuthorData(quoteId) {
    console.log(quoteId)
    const quoteReqString = `
        SELECT party_people.ID AS humanId, CONCAT(party_people.name, ' ', party_people.surname) AS name
        FROM party_people
        WHERE party_people.ID = (
            SELECT golden_quotes.human_id 
            FROM golden_quotes 
            WHERE golden_quotes.quote_id = ?
        );
    `
    try {
        const [quoteReq] = await pool.query(quoteReqString, [quoteId])
        console.log(`zapytanie: ${quoteReq}`)
        const humanToProcess = quoteReq[0]
        humanToProcess["photoDir"] = getHumanPhotoDir(humanToProcess["humanId"])
        return humanToProcess
    }
    catch (error) {
        return error
    }


}