import dotenv from 'dotenv'
import mysql from 'mysql2'
dotenv.config()
const pool = mysql.createPool({
    host     : process.env.host,
    user     : process.env.MYSQL_USER,
    database : process.env.MYSQL_DATABASE
}).promise()

export default async function addEventCompanion(eventId, humansList) {
    const pairsToAdd = humansList.map(humanId => [eventId, humanId])
    const queryText = "INSERT INTO `event_companion` (`event_id`, `human_id`) VALUES ?;"
    const [ addHumansQuery ] = await pool.query(queryText, [pairsToAdd])
    return addHumansQuery
}